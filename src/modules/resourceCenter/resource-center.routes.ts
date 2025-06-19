import { Router } from 'express';
import type { RequestHandler } from 'express';
import { ResourceCenterController } from './resource-center.controller';
import multer from 'multer';

/**
 * @swagger
 * tags:
 *   name: Resource Center
 *   description: Resource center management endpoints
 */

const router = Router();
const resourceCenterController = new ResourceCenterController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'video/mp4',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only PDF, PNG, JPG, and MP4 are allowed'),
      );
    }
  },
});

/**
 * @swagger
 * /api/resourceCenter/tag:
 *   post:
 *     summary: Create a new tag
 *     tags: [Resource Center]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *             properties:
 *               tagName:
 *                 type: string
 *                 description: Name of the tag (must be unique)
 *               updatedBy:
 *                 type: string
 *                 description: ID of the user who updated the tag
 *               createdBy:
 *                 type: string
 *                 description: ID of the user who created the tag
 *     responses:
 *       200:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tag created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "68527b1a22ed614fdd3deed1"
 *                     tagName:
 *                       type: string
 *                       example: "Sales"
 *                     updatedBy:
 *                       type: string
 *                       example: "user123"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T08:38:50.679Z"
 *                     createdBy:
 *                       type: string
 *                       example: "user123"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T08:38:50.679Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-18T08:38:50.724Z"
 *       409:
 *         description: Tag with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Tag with name 'Sales' already exists"
 *                 error:
 *                   type: string
 *                   example: "Tag with name 'Sales' already exists"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-18T08:40:22.488Z"
 *       500:
 *         description: Internal server error
 */
router.post(
  '/tag',
  resourceCenterController.createTag.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/tag:
 *   get:
 *     summary: Get all tags
 *     tags: [Resource Center]
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully fetched all tags."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68527bb222ed614fdd3deed6"
 *                       tagName:
 *                         type: string
 *                         example: "Admin"
 *                       updatedBy:
 *                         type: string
 *                         example: "user123"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-18T08:41:22.295Z"
 *                       createdBy:
 *                         type: string
 *                         example: "user123"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-18T08:41:22.295Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-18T08:41:41.737Z"
 *       500:
 *         description: Internal server error
 */
router.get(
  '/tag',
  resourceCenterController.getAllTags.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/tag/{id}:
 *   get:
 *     summary: Get a specific tag by ID
 *     tags: [Resource Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/tag/:id',
  resourceCenterController.getTagById.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter:
 *   post:
 *     summary: Create a new resource center entry
 *     tags: [Resource Center]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *               - resourceCategory
 *               - subCategory
 *               - title
 *               - description
 *               - publish
 *               - tags
 *               - roles
 *             properties:
 *               channelId:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     channelId:
 *                       type: string
 *                       description: ObjectId of the channel
 *                     channelName:
 *                       type: string
 *                       description: Name of the channel
 *               resourceCategory:
 *                 type: string
 *                 description: ObjectId referencing the resources collection
 *               subCategory:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Videos, PDF, Article, Infographics]
 *                 description: Sub categories (case-insensitive, will be converted to uppercase)
 *               isActive:
 *                 type: boolean
 *                 default: false
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               documentId:
 *                 type: string
 *                 description: UUID (auto-generated if not provided)
 *               publish:
 *                 type: string
 *                 enum: [publish, draft]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tagName:
 *                       type: string
 *                     tagId:
 *                       type: string
 *                       description: ObjectId referencing the tags collection
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     roleId:
 *                       type: string
 *                       description: ObjectId referencing the roles collection
 *                     roleName:
 *                       type: string
 *                       description: Name of the role
 *               updatedBy:
 *                 type: string
 *                 description: ObjectId of the user who updated
 *               createdBy:
 *                 type: string
 *                 description: ObjectId of the user who created
 *     responses:
 *       201:
 *         description: Resource center created successfully
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  resourceCenterController.createResourceCenter.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/{resourceCenterId}:
 *   put:
 *     summary: Update a resource center entry
 *     tags: [Resource Center]
 *     parameters:
 *       - in: path
 *         name: resourceCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource center ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channelId:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     channelId:
 *                       type: string
 *                     channelName:
 *                       type: string
 *               resourceCategory:
 *                 type: string
 *               subCategory:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Videos, PDF, Article, Infographics]
 *                 description: Sub categories (case-insensitive, will be converted to uppercase)
 *               isActive:
 *                 type: boolean
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               publish:
 *                 type: string
 *                 enum: [publish, draft]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tagName:
 *                       type: string
 *                     tagId:
 *                       type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     roleId:
 *                       type: string
 *                       description: ObjectId referencing the roles collection
 *                     roleName:
 *                       type: string
 *                       description: Name of the role
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource center updated successfully
 *       404:
 *         description: Resource center not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:resourceCenterId',
  resourceCenterController.updateResourceCenter.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/admin/resourceCenter:
 *   get:
 *     summary: Get all resource center entries
 *     tags: [Resource Center]
 *     responses:
 *       200:
 *         description: List of resource centers retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '/admin/resourceCenter',
  resourceCenterController.getAllResourceCenters.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/admin/resourceCenter:
 *   get:
 *     summary: Get filtered resource center entries
 *     tags: [Resource Center]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag name
 *       - in: query
 *         name: contentType
 *         schema:
 *           type: string
 *           enum: [all, pdf, video, article, infographics]
 *         description: Filter by content type
 *     responses:
 *       200:
 *         description: Filtered resource centers retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '/admin/resourceCenter/filter',
  resourceCenterController.getResourceCentersByFilters.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/agent/resourceCenter:
 *   get:
 *     summary: Get active and published resource centers for agents
 *     tags: [Resource Center]
 *     description: Retrieves resource centers that are active (isActive=true) and published (publish='publish') with optional filtering
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag name
 *       - in: query
 *         name: contentType
 *         schema:
 *           type: string
 *           enum: [all, pdf, video, article, infographics]
 *         description: Filter by content type
 *       - in: query
 *         name: resourceCategory
 *         schema:
 *           type: string
 *         description: Filter by resource category ObjectId
 *     responses:
 *       200:
 *         description: Active and published resource centers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully fetched filtered resource centers for agents."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       channelId:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             channelId:
 *                               type: string
 *                             channelName:
 *                               type: string
 *                       resourceCategory:
 *                         type: string
 *                       subCategory:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       documentId:
 *                         type: string
 *                       publish:
 *                         type: string
 *                         enum: [publish, draft]
 *                         example: "publish"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             tagName:
 *                               type: string
 *                             tagId:
 *                               type: string
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             roleId:
 *                               type: string
 *                             roleName:
 *                               type: string
 *                       documents:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             documentId:
 *                               type: string
 *                             s3Key:
 *                               type: string
 *                             s3Link:
 *                               type: string
 *                             documentType:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             documentFormat:
 *                               type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get(
  '/agent/resourceCenter',
  resourceCenterController.getResourceCentersForAgents.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/admin/resourceCenter/{resourceCenterId}:
 *   get:
 *     summary: Get resource center with documents
 *     tags: [Resource Center]
 *     parameters:
 *       - in: path
 *         name: resourceCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource center ID
 *     responses:
 *       200:
 *         description: Resource center with documents retrieved successfully
 *       404:
 *         description: Resource center not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/admin/resourceCenter/:resourceCenterId',
  resourceCenterController.getResourceCenterWithDocuments.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/document:
 *   post:
 *     summary: Create a resource center document with file upload
 *     tags: [Resource Center]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resourceCenterId
 *               - documentType
 *               - file
 *             properties:
 *               resourceCenterId:
 *                 type: string
 *                 description: ObjectId of the resource center (documentId will be auto-fetched)
 *               documentType:
 *                 type: string
 *                 enum: [VIDEOS, PDF, ARTICLE, INFOGRAPHICS]
 *                 description: Document type (case-insensitive, will be converted to uppercase)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, PNG, JPG, MP4) - format will be automatically detected
 *               updatedBy:
 *                 type: string
 *                 description: ObjectId of the user who updated
 *               createdBy:
 *                 type: string
 *                 description: ObjectId of the user who created
 *     responses:
 *       201:
 *         description: Resource center document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource center document created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "685296a9f97b9acc2dd94a73"
 *                     documentId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     s3Key:
 *                       type: string
 *                       example: "ba9c5956-ab2c-46a0-8656-e86b4d0edb41.pdf"
 *                     s3Link:
 *                       type: string
 *                       example: "https://salesverse-inxt-public-documents-20250531.s3.ap-southeast-1.amazonaws.com/ba9c5956-ab2c-46a0-8656-e86b4d0edb41.pdf"
 *                     documentType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["PDF"]
 *                     documentFormat:
 *                       type: string
 *                       example: "pdf"
 *                     createdBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T10:36:25.298Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T11:07:18.762Z"
 *                     updatedBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-18T11:07:18.845Z"
 *       400:
 *         description: Bad request - Invalid file type, missing file, or invalid document type
 *       404:
 *         description: Resource center not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/document',
  upload.single('file'),
  resourceCenterController.createResourceCenterDocument.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

/**
 * @swagger
 * /api/resourceCenter/document/{id}:
 *   patch:
 *     summary: Update a resource center document with file upload
 *     tags: [Resource Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [VIDEOS, PDF, ARTICLE, INFOGRAPHICS]
 *                 description: Document type (case-insensitive, will be converted to uppercase)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, PNG, JPG, MP4) - format will be automatically detected
 *               updatedBy:
 *                 type: string
 *                 description: ObjectId of the user who updated
 *     responses:
 *       200:
 *         description: Resource center document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource center document updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "685296a9f97b9acc2dd94a73"
 *                     documentId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439015"
 *                     s3Key:
 *                       type: string
 *                       example: "ba9c5956-ab2c-46a0-8656-e86b4d0edb41.pdf"
 *                     s3Link:
 *                       type: string
 *                       example: "https://salesverse-inxt-public-documents-20250531.s3.ap-southeast-1.amazonaws.com/ba9c5956-ab2c-46a0-8656-e86b4d0edb41.pdf"
 *                     documentType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["PDF"]
 *                     documentFormat:
 *                       type: string
 *                       example: "pdf"
 *                     createdBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T10:36:25.298Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-18T11:07:18.762Z"
 *                     updatedBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-18T11:07:18.845Z"
 *       400:
 *         description: Bad request - Invalid file type, missing file, or invalid document type
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/document/:id',
  upload.single('file'),
  resourceCenterController.updateResourceCenterDocument.bind(
    resourceCenterController,
  ) as unknown as RequestHandler,
);

export default router;
