import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepository: Repository<Reservation>,
    ) { }

    async create(createReservationDto: CreateReservationDto) {
        const { tableId, reservationTime, restaurantId } = createReservationDto;

        // Validation: Check overlap (Assuming 2 hours duration)
        if (tableId) {
            const durationMs = 2 * 60 * 60 * 1000; // 2 hours
            const newTime = new Date(reservationTime).getTime();
            const startTime = new Date(newTime - durationMs);
            const endTime = new Date(newTime + durationMs);

            const conflicting = await this.reservationRepository.findOne({
                where: {
                    restaurantId,
                    tableId,
                    status: 'active',
                    reservationTime: Between(startTime, endTime)
                }
            });

            if (conflicting) {
                throw new Error('This table is already reserved for this time range.');
            }
        }

        const reservation = this.reservationRepository.create(createReservationDto);
        return await this.reservationRepository.save(reservation);
    }

    async findAll(restaurantId: string, date?: string) {
        const where: any = { restaurantId };

        if (date) {
            // Find for specific date (entire day)
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            where.reservationTime = Between(start, end);
        }

        return await this.reservationRepository.find({
            where,
            order: { reservationTime: 'ASC' },
            withDeleted: true // Include soft-deleted if needed, usually not for active view
        });
    }

    async findOne(id: string) {
        return await this.reservationRepository.findOneBy({ id });
    }

    async update(id: string, updateReservationDto: UpdateReservationDto) {
        await this.reservationRepository.update(id, updateReservationDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        return await this.reservationRepository.softDelete(id);
    }
}
