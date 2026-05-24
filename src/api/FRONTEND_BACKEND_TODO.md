# Backend TODO for frontend integration

## Applications

Frontend already sends additional query params for admin applications:

```http
GET /admin/applications?categoryIds=1,2&fulfillmentType=delivery
```

Need to support:
```js
categoryIds?: string — comma-separated item category IDs
fulfillmentType?: 'pickup' | 'delivery'
```

Existing params:

page
limit
search
status
orderBy
Items

Frontend already sends additional query params for admin items:

```http
GET /admin/items?categoryIds=1,2
```

Need to support:

```js
categoryIds?: string — comma-separated item category IDs
```
Existing params:

page
limit
search
orderBy
Item update

Frontend already calls:

```htto
PATCH /admin/items/{id}
```

Expected body:

```js
{
  name?: string;
  categoryId?: number;
  unit?: 'шт' | 'уп';
  receivedQuantity?: number;
}
```

Expected behavior:

update item name/category/unit if provided;
increase quantityInStock by receivedQuantity;
return updated ItemAdminResponseDto.
Reports

Frontend already calls:

```http
GET /admin/reports/aid-by-categories?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
```

Expected response:

```js
{
  dateFrom: string;
  dateTo: string;
  totals: {
    received: number;
    issued: number;
    remaining: number;
  };
  categories: {
    categoryId: number;
    categoryName: string;
    received: number;
    issued: number;
    remaining: number;
  }[];
}
```

Frontend also calls:

```http
GET /admin/reports/aid-by-categories/export?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
```

Expected response:

CSV or XLSX file.