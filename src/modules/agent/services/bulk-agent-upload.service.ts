import { read as readXlsx, utils as xlsxUtils } from 'xlsx';
import { AgentRepository } from '../agent.repository';
import { ChannelRepository } from '@/modules/channel/channel.repository';
import { DesignationRepository } from '@/modules/designation/designation.repository';
import { UserRepository } from '@/modules/user/user.repository';
import { ProjectRepository } from '@/modules/project/project.repository';
import { BadRequestException } from '@/common/exceptions/bad-request.exception';
import { AgentCodeGenerator } from '../utils/agent-code-generator';
import { Types } from 'mongoose';

interface ExcelRow {
  'Agent First Name': string;
  'Agent Last Name': string;
  'Email': string;
  'Mobile Number': string;
  'Channel': string;
  'Designation': string;
  'Agent Code'?: string;
  'Branch'?: string;
  'Appointment Date'?: string;
  'CA Number'?: string;
  'Province'?: string;
  'City'?: string;
  'Pin Code'?: string;
  'Status'?: string;
  'Reporting Manager ID'?: string;
  'TIN'?: string;
  [key: string]: string | undefined;
}

interface ValidationError {
  row: number;
  error: string;
  field: string;
  data: ExcelRow;
}

interface ProcessResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  batchSize: number;
  errors: ValidationError[];
  createdAgents: Array<{
    agentCode: string;
    email: string;
    name: string;
    userId: string;
    status: string;
  }>;
}

export class BulkAgentUploadService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly designationRepository: DesignationRepository,
    private readonly userRepository: UserRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly agentCodeGenerator: AgentCodeGenerator,
  ) {}

  async processExcelFile(
    fileBuffer: Buffer,
    projectId: string,
    batchSize = 100,
  ): Promise<ProcessResult> {
    const workbook = readXlsx(fileBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsxUtils.sheet_to_json<ExcelRow>(worksheet);

    const result: ProcessResult = {
      totalProcessed: rows.length,
      successCount: 0,
      failureCount: 0,
      batchSize,
      errors: [],
      createdAgents: [],
    };

    // Validate project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Process in batches
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await this.processBatch(batch, result, projectId, i);
    }

    return result;
  }

  private async processBatch(
    batch: ExcelRow[],
    result: ProcessResult,
    projectId: string,
    startIndex: number,
  ): Promise<void> {
    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowIndex = startIndex + i + 2; // +2 for Excel row number (header + 1-based)

      try {
        const validationErrors = await this.validateRow(row, rowIndex);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          result.failureCount++;
          continue;
        }

        const agent = await this.createAgentFromRow(row, projectId);
        result.createdAgents.push({
          agentCode: agent.agentCode,
          email: agent.email ?? '',
          name: `${agent.firstName} ${agent.lastName}`,
          userId: agent.userId.toString(),
          status: agent.agentStatus,
        });
        result.successCount++;
      } catch (error) {
        if (error instanceof Error) {
          result.errors.push({
            row: rowIndex,
            error: error.message,
            field: 'General',
            data: row,
          });
        } else {
          result.errors.push({
            row: rowIndex,
            error: 'An unknown error occurred',
            field: 'General',
            data: row,
          });
        }
        result.failureCount++;
      }
    }
  }

  private async validateRow(
    row: ExcelRow,
    rowIndex: number,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Required fields validation
    const requiredFields = [
      'Agent First Name',
      'Agent Last Name',
      'Email',
      'Mobile Number',
      'Channel',
      'Designation',
    ];

    for (const field of requiredFields) {
      if (!row[field]) {
        errors.push({
          row: rowIndex,
          error: `${field} is required`,
          field,
          data: row,
        });
      }
    }

    if (errors.length > 0) return errors;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.Email)) {
      errors.push({
        row: rowIndex,
        error: 'Invalid email format',
        field: 'Email',
        data: row,
      });
    }

    // Phone number format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(row['Mobile Number'])) {
      errors.push({
        row: rowIndex,
        error: 'Invalid phone number format',
        field: 'Mobile Number',
        data: row,
      });
    }

    // Check email uniqueness
    const existingUserByEmail = await this.userRepository.findOne({ email: row.Email });
    if (existingUserByEmail) {
      errors.push({
        row: rowIndex,
        error: 'Email already exists',
        field: 'Email',
        data: row,
      });
    }

    // Check agent code uniqueness if provided
    if (row['Agent Code']) {
      const existingAgent = await this.agentRepository.findOne({ agentCode: row['Agent Code'] });
      if (existingAgent) {
        errors.push({
          row: rowIndex,
          error: 'Agent code already exists',
          field: 'Agent Code',
          data: row,
        });
      }
    }

    // Validate channel
    const channel = await this.channelRepository.findOne({
      $or: [
        { _id: new Types.ObjectId(row.Channel) },
        { name: row.Channel },
        { code: row.Channel },
      ],
    });
    if (!channel) {
      errors.push({
        row: rowIndex,
        error: 'Invalid channel',
        field: 'Channel',
        data: row,
      });
    }

    // Validate designation
    const designation = await this.designationRepository.findOne({
      $or: [
        { _id: new Types.ObjectId(row.Designation) },
        { name: row.Designation },
        { code: row.Designation },
      ],
    });
    if (!designation) {
      errors.push({
        row: rowIndex,
        error: 'Invalid designation',
        field: 'Designation',
        data: row,
      });
    }

    // Validate reporting manager if provided
    if (row['Reporting Manager ID']) {
      const reportingManager = await this.agentRepository.findOne({
        $or: [
          { _id: new Types.ObjectId(row['Reporting Manager ID']) },
          { agentCode: row['Reporting Manager ID'] },
        ],
      });
      if (!reportingManager) {
        errors.push({
          row: rowIndex,
          error: 'Invalid reporting manager',
          field: 'Reporting Manager ID',
          data: row,
        });
      }
    }

    // Validate status if provided
    if (row.Status && !['active', 'inactive', 'suspended'].includes(row.Status.toLowerCase())) {
      errors.push({
        row: rowIndex,
        error: 'Invalid status. Must be one of: active, inactive, suspended',
        field: 'Status',
        data: row,
      });
    }

    return errors;
  }

  private async createAgentFromRow(row: ExcelRow, projectId: string) {
    // Find channel and designation IDs
    const channel = await this.channelRepository.findOne({
      $or: [
        { _id: new Types.ObjectId(row.Channel) },
        { name: row.Channel },
        { code: row.Channel },
      ],
    });

    const designation = await this.designationRepository.findOne({
      $or: [
        { _id: new Types.ObjectId(row.Designation) },
        { name: row.Designation },
        { code: row.Designation },
      ],
    });

    if (!channel || !designation) {
      throw new BadRequestException('Channel or designation not found');
    }

    // Find reporting manager if provided
    let reportingManagerId;
    if (row['Reporting Manager ID']) {
      const reportingManager = await this.agentRepository.findOne({
        $or: [
          { _id: new Types.ObjectId(row['Reporting Manager ID']) },
          { agentCode: row['Reporting Manager ID'] },
        ],
      });
      reportingManagerId = reportingManager?._id;
    }

    // Generate agent code if not provided
    const agentCode = row['Agent Code'] || await this.agentCodeGenerator.generateCode(projectId);

    return this.agentRepository.create({
      channelId: new Types.ObjectId(channel._id.toString()),
      designationId: new Types.ObjectId(designation._id.toString()),
      projectId: new Types.ObjectId(projectId),
      agentCode,
      employeeId: row['CA Number'],
      firstName: row['Agent First Name'],
      lastName: row['Agent Last Name'],
      email: row.Email,
      phoneNumber: row['Mobile Number'],
      agentStatus: (row.Status?.toLowerCase() as 'active' | 'inactive' | 'suspended') || 'active',
      joiningDate: row['Appointment Date'] ? new Date(row['Appointment Date']) : new Date(),
      reportingManagerId: reportingManagerId ? new Types.ObjectId(reportingManagerId.toString()) : undefined,
    });
  }
}