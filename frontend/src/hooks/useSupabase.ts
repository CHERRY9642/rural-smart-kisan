import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { marketplaceService } from '@/services/marketplaceService';
import { session } from '@/services/apiClient';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ProductFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface EnhancedProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  seller: string;
  location: string;
  rating: number;
  images: ProductImage[];
  description: string;
  category: string;
  freshness: string;
  postedAt: Date;
  isOrganic: boolean;
  likesCount: number;
  savesCount: number;
  feedback: ProductFeedback[];
}

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadImages = async (files: File[], productId: string): Promise<ProductImage[]> => {
    setLoading(true);
    try {
      // Mock implementation - replace with actual Supabase storage upload
      const uploadedImages: ProductImage[] = files.map((file, index) => ({
        id: `${productId}-image-${index}`,
        url: URL.createObjectURL(file), // Temporary URL for demo
        alt: file.name
      }));

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${files.length} image(s).`,
      });

      return uploadedImages;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any, images: File[]): Promise<EnhancedProduct | null> => {
    setLoading(true);
    try {
      const productId = String(Date.now());
      
      // Upload images first
      const uploadedImages = await uploadImages(images, productId);

      const payload = {
        ...productData,
        images: uploadedImages,
      };

      const { product } = await marketplaceService.createProduct(payload);
      const newProduct: EnhancedProduct = {
        ...product,
        postedAt: new Date(product.postedAt),
        feedback: (product.feedback ?? []).map((item: ProductFeedback) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      };

      toast({
        title: "Product created",
        description: "Your product has been listed successfully!",
      });

      return newProduct;
    } catch (error) {
      toast({
        title: "Failed to create product",
        description: "Please try again later.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (productId: string, rating: number, comment: string): Promise<ProductFeedback | null> => {
    setLoading(true);
    try {
      const { feedback } = await marketplaceService.addFeedback(productId, rating, comment);
      const normalizedFeedback: ProductFeedback = {
        ...feedback,
        createdAt: new Date(feedback.createdAt),
        userName: feedback.userName ?? session.getUser()?.name ?? 'Current User'
      };

      toast({
        title: "Feedback submitted",
        description: "Thank you for your review!",
      });

      return normalizedFeedback;
    } catch (error) {
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (productId: string, liked: boolean): Promise<boolean> => {
    try {
      const result = await marketplaceService.toggleLike(productId, liked);
      toast({
        title: result.liked ? "Added to favorites" : "Removed from favorites",
        description: result.liked ? "Product saved to your favorites." : "Product removed from favorites.",
      });
      return result.liked;
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      return liked;
    }
  };

  return {
    loading,
    uploadImages,
    createProduct,
    addFeedback,
    toggleLike
  };
};
