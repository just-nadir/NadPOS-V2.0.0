import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('reservations')
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'restaurant_id' })
    restaurantId: string;

    @Column({ name: 'table_id', nullable: true })
    tableId: string;

    @Column({ name: 'customer_name', nullable: true })
    customerName: string;

    @Column({ name: 'customer_phone', nullable: true })
    customerPhone: string;

    @Column({ name: 'reservation_time', type: 'timestamp' })
    reservationTime: Date;

    @Column({ default: 1 })
    guests: number;

    @Column({ nullable: true })
    note: string;

    @Column({ default: 'active' }) // active, completed, cancelled
    status: string;

    @Column({ name: 'is_synced', default: 0 })
    isSynced: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
