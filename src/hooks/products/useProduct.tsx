import { PaginationRequest } from '@/interfaces/pagination.interface';
import { CreateProduct } from '@/interfaces/product.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { ProductEndpoint } from '@/services/endpoints/product.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';

export function useProduct() {
  const navigation = useNavigation<any>();
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const create = async (data: CreateProduct, image: any) => {
    try {
      showLoading();

      const form = new FormData();
      form.append('name', data.name);
      form.append('sku', data.sku || '');
      if (data.barcode) {
        form.append('barcode', data.barcode);
      }
      form.append('cost', String(data.cost));
      form.append('price', String(data.price));
      form.append('stock', String(data.stock));

      if (data.categoryId) {
        form.append('categoryId', data.categoryId);
      }

      if (image) {
        console.log(image, 'image');
        form.append('image', {
          uri: image,
          name: image.fileName ?? `product-${Date.now()}.jpg`,
          type: image.type ?? 'image/jpeg',
        });
      }
      console.log(form, 'form');

      await ProductEndpoint.create(form);

      showToast('Produk berhasil dibuat 🎉', 'success');
      navigation.goBack();
    } catch (err) {
      console.log(err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      hideLoading();
    }
  };

  const update = async (id: string, data: CreateProduct, image: any) => {
    try {
      showLoading();

      const form = new FormData();
      form.append('name', data.name);
      form.append('sku', data.sku || '');
      form.append('barcode', data.barcode || '');
      form.append('cost', String(data.cost));
      form.append('price', String(data.price));
      form.append('stock', String(data.stock));

      if (data.categoryId) {
        form.append('categoryId', data.categoryId);
      }

      if (image) {
        form.append('image', {
          uri: image.uri,
          name: image.fileName ?? 'product.jpg',
          type: image.type ?? 'image/jpeg',
        });
      }

      await ProductEndpoint.update(id, form);

      showToast('Produk berhasil diupdate 🎉', 'success');
      navigation.goBack();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      hideLoading();
    }
  };

  const getProductPagination = async (params: PaginationRequest) => {
    try {
      showLoading();
      const res = await ProductEndpoint.getPagination(params);
      console.log(res);
      return res.data;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      showLoading();
      await ProductEndpoint.delete(id);
      showToast('Produk dihapus', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      hideLoading();
    }
  };

  return { create, update, getProductPagination, deleteProduct };
}
