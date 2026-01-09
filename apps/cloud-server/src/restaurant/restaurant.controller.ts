import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller()
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    // --- ADMIN ENDPOINTS ---

    @Post('admin/restaurants')
    create(@Body() createRestaurantDto: CreateRestaurantDto) {
        return this.restaurantService.create(createRestaurantDto);
    }

    @Get('admin/restaurants')
    findAll() {
        return this.restaurantService.findAll();
    }

    @Get('admin/restaurants/:id')
    findOne(@Param('id') id: string) {
        return this.restaurantService.findOne(id);
    }

    @Patch('admin/restaurants/:id')
    update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
        return this.restaurantService.update(id, updateRestaurantDto);
    }

    @Delete('admin/restaurants/:id')
    remove(@Param('id') id: string) {
        return this.restaurantService.remove(id);
    }

    // --- PUBLIC / POS ENDPOINTS ---

    @Get('restaurants/:id/verify')
    async verify(@Param('id') id: string, @Headers('x-access-key') accessKey: string) {
        return await this.restaurantService.verify(id, accessKey);
    }
}
