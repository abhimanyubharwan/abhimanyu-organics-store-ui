import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
@Component({selector:'app-header',standalone:true,imports:[RouterLink,RouterLinkActive],templateUrl:'./header.component.html'})
export class HeaderComponent{catalog=inject(CatalogService);menu=signal(false);toggle(){this.menu.update(v=>!v)}}
