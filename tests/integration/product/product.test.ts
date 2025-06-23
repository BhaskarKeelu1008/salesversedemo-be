import * as dbHandler from 'tests/integration/setup';
import { ProductModel } from '@/models/product.model';
import { ProductCategoryModel } from '@/models/product-category.model';
import { Types } from 'mongoose';

jest.setTimeout(30000);

describe('Product Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('Product Model', () => {
    // Create a product category first to use as a reference
    let categoryId: Types.ObjectId;
    let userId: Types.ObjectId;

    beforeEach(async () => {
      // Create a user ID for the createdBy field
      userId = new Types.ObjectId();

      // Create a product category to use for the product tests
      const categoryData = {
        categoryName: 'Test Category',
        sequenceNumber: 1,
        status: 'active',
        createdBy: userId,
      };

      const category = await new ProductCategoryModel(categoryData).save();
      categoryId = category._id as unknown as Types.ObjectId;
    });

    it('should create a new product successfully', async () => {
      const productData = {
        productCategoryId: categoryId,
        channelIds: [new Types.ObjectId(), new Types.ObjectId()],
        productName: 'Test Product',
        status: 'active',
        reasonsToBuy: {
          reason1: 'First reason to buy',
          reason2: 'Second reason to buy',
        },
        media: {
          videos: [],
          images: [],
        },
        files: [],
        createdBy: userId,
      };

      const product = new ProductModel(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.productName).toBe(productData.productName);
      expect(savedProduct.status).toBe(productData.status);
      expect(savedProduct.channelIds.length).toBe(2);
      expect(savedProduct.reasonsToBuy.reason1).toBe(
        productData.reasonsToBuy.reason1,
      );
    });

    it('should not create a product without channels', async () => {
      const productData = {
        productCategoryId: categoryId,
        channelIds: [],
        productName: 'Test Product',
        status: 'active',
        reasonsToBuy: {
          reason1: 'First reason to buy',
          reason2: 'Second reason to buy',
        },
        media: {
          videos: [],
          images: [],
        },
        files: [],
        createdBy: userId,
      };

      const product = new ProductModel(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should find a product by ID', async () => {
      const productData = {
        productCategoryId: categoryId,
        channelIds: [new Types.ObjectId()],
        productName: 'Test Product',
        status: 'active',
        reasonsToBuy: {
          reason1: 'First reason to buy',
          reason2: 'Second reason to buy',
        },
        media: {
          videos: [],
          images: [],
        },
        files: [],
        createdBy: userId,
      };

      const savedProduct = await new ProductModel(productData).save();
      const foundProduct = await ProductModel.findById(savedProduct._id);

      expect(foundProduct).not.toBeNull();
      expect(foundProduct?.productName).toBe(productData.productName);
    });

    it('should update a product', async () => {
      const productData = {
        productCategoryId: categoryId,
        channelIds: [new Types.ObjectId()],
        productName: 'Test Product',
        status: 'active',
        reasonsToBuy: {
          reason1: 'First reason to buy',
          reason2: 'Second reason to buy',
        },
        media: {
          videos: [],
          images: [],
        },
        files: [],
        createdBy: userId,
      };

      const savedProduct = await new ProductModel(productData).save();

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        savedProduct._id,
        {
          productName: 'Updated Product Name',
          status: 'inactive',
          productDescription: 'New description',
        },
        { new: true },
      );

      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct?.productName).toBe('Updated Product Name');
      expect(updatedProduct?.status).toBe('inactive');
      expect(updatedProduct?.productDescription).toBe('New description');
    });

    it('should soft delete a product', async () => {
      const productData = {
        productCategoryId: categoryId,
        channelIds: [new Types.ObjectId()],
        productName: 'Test Product',
        status: 'active',
        reasonsToBuy: {
          reason1: 'First reason to buy',
          reason2: 'Second reason to buy',
        },
        media: {
          videos: [],
          images: [],
        },
        files: [],
        createdBy: userId,
      };

      const savedProduct = await new ProductModel(productData).save();

      const deletedProduct = await ProductModel.findByIdAndUpdate(
        savedProduct._id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      );

      expect(deletedProduct).not.toBeNull();
      expect(deletedProduct?.isDeleted).toBe(true);
      expect(deletedProduct?.deletedAt).toBeDefined();
    });
  });
});
