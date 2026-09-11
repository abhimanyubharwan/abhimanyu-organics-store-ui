import { Component, Input, inject } from '@angular/core'; import { RouterLink } from '@angular/router'; import { CatalogService, Product } from '../../services/catalog.service';
@Component({selector:'app-product-card',standalone:true,imports:[RouterLink],templateUrl:'./product-card.component.html'})
export class ProductCardComponent{@Input({required:true}) product!:Product; catalog=inject(CatalogService)}
