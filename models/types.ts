export type Ticket = {
  id: number;//
  client_name: string;//
  seller_name: string;//
  vehicle_plate: string;//
  type: string;//
  needs_facture: boolean;//
  payment_status: string;//
  date: string;//
  is_canceled: boolean; // 
  subtotal: number; //
  discount: number; 
  taxes: number; //
  total: number; //
  office_id: number; //
  comment: string; //
};

export type TicketDetail = {
  ticket_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  taxes_percentage: number;
  discount_percentage: number;
  exonerated: boolean;
  description: string;
};

export type FactureTicketDetail = {
  ticket_id: number;
  client_name: string;
  id_card: string;
  phone: string;  email: string;
  address: string;
  total: number;
  date: string;
  total_without_iva: number;
};