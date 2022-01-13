import { Component } from '@angular/core';
import { faVolumeUp, faVolumeOff } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  maxValueIcon = faVolumeUp
  minValueIcon = faVolumeOff
  value1 = 260
  value2 = -20
  valMax = 200
  valMin = 0
  rangeWidth = 400

  setValues(params: any) {
    if (params.id == 'thumb2') {
      this.value2 = params.val
    } else {
      this.value1 = params.val
    }
  }
}