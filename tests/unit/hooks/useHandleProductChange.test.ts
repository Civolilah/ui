import { describe, expect, test, vi } from 'vitest';
import type { InvoiceItem } from '$app/common/interfaces/invoice-item';
import type { Product } from '$app/common/interfaces/product';
import type { ProductTableResource } from '$app/pages/invoices/common/components/ProductsTable';
import { useHandleProductChange } from '$app/pages/invoices/common/hooks/useHandleProductChange';

const mocks = vi.hoisted(() => ({
  company: {
    fill_products: true,
    enable_product_quantity: false,
    default_quantity: true,
    convert_products: false,
    settings: { currency_id: '1' },
  },
}));

vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => mocks.company,
}));
vi.mock('$app/common/hooks/useResolveCurrency', () => ({
  useResolveCurrency: () => () => undefined,
}));
vi.mock('$app/common/hooks/clients/useClientResolver', () => ({
  useClientResolver: () => ({ find: vi.fn() }),
}));

const product = {
  product_key: 'pro_plan',
  price: 12,
  cost: 0,
  quantity: 3,
  notes: 'The Pro Plan',
  tax_name1: '',
  tax_rate1: 0,
  custom_value1: '',
  custom_value4: '',
} as Product;

const lineItem = (overrides: Partial<InvoiceItem> = {}) =>
  ({
    _id: 'line-1',
    product_key: '',
    quantity: 5,
    cost: 100,
    notes: 'Tracked task',
    tax_name1: '',
    tax_rate1: 0,
    custom_value1: '',
    custom_value4: '',
    ...overrides,
  }) as InvoiceItem;

const handleChange = (type: 'product' | 'task', item: InvoiceItem) => {
  const onChange = vi.fn();
  const resource = { line_items: [item] } as unknown as ProductTableResource;

  return {
    onChange,
    handler: useHandleProductChange({
      relationType: 'client_id',
      resource,
      type,
      onChange,
    }),
  };
};

describe('useHandleProductChange', () => {
  test('keeps logged hours and rate when a service is selected on a task line', async () => {
    const { onChange, handler } = handleChange('task', lineItem());

    await handler(0, 'pro_plan', product);

    expect(onChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        product_key: 'pro_plan',
        quantity: 5,
        cost: 100,
        notes: 'Tracked task',
      })
    );
  });

  test('auto-fills quantity and cost on a product line', async () => {
    const { onChange, handler } = handleChange(
      'product',
      lineItem({ notes: '' })
    );

    await handler(0, 'pro_plan', product);

    expect(onChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        product_key: 'pro_plan',
        quantity: 1,
        cost: 12,
        notes: 'The Pro Plan',
      })
    );
  });
});
