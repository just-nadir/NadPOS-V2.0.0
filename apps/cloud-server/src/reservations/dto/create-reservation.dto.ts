export class CreateReservationDto {
    restaurantId: string;
    tableId?: string;
    customerName?: string;
    customerPhone?: string;
    reservationTime: string; // ISO String
    guests: number;
    note?: string;
    status?: string;
    isSynced?: number;
}
