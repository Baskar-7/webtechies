import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {

  @Input() label: string = ''
  @Input() data: any[] = []
  @Output() handleActions = new EventEmitter<any>();
 
  toggleDropdown(className: string, option : string) {  
    var dropdown = $('.' + this.label +'_list'); 
    if (option == 'close') {
      dropdown.removeClass('active');
      dropdown.find('.dropdown-menu').slideUp(300);
    } else {
      dropdown.toggleClass('active');
      dropdown.find('.dropdown-menu').slideToggle(300);
    }
  }

  selectOption(event: Event)
  {
    event.preventDefault();
    var ele = event.target as HTMLElement;
    if(ele && ele.tagName == 'LI')
    { 
      var option = ele.innerText;
      this.handleActions.emit({'labelValue': this.label, 'value' : option});
      $('.'+this.label+'_selected_category').text(option);
      this.toggleDropdown('project-types-list','close');
    } 
  }

}
