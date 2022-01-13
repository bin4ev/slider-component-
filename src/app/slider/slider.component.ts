import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Renderer2,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnChanges,
  Directive,
  ElementRef,
  HostListener,
} from '@angular/core';

const MAX_WIDTH = 500
const MIN_WIDTH = 100

@Directive({
  selector: "[ccTooltip]"
})
export class Tooltip {
  @Input('ccTooltip') valueThumb = ''
  @Input('pressedBtn') pressedBtn!: boolean

  constructor(private elRefL: ElementRef, private renderer: Renderer2) { }

  ngOnChanges() {
    if (this.pressedBtn) {
      this.elRefL.nativeElement.removeAttribute('data-before')
    }
  }

  @HostListener('mousedown') initEvents(){
    if (this.elRefL.nativeElement.classList.contains('disabled')) {
      return
    }

    this.renderer.listen(this.elRefL.nativeElement, 'mouseover', this.showTooltip.bind(this))
    this.renderer.listen(this.elRefL.nativeElement, 'mouseout', this.hideTooltip.bind(this))
  }

  showTooltip() {
    this.elRefL.nativeElement.setAttribute('data-before', this.valueThumb)
  }

  hideTooltip() {
    this.elRefL.nativeElement.removeAttribute('data-before')
  }
}

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent implements
  OnInit,
  AfterViewInit {

  @ViewChildren('thumb') thumbs!: QueryList<any>
  @ViewChildren('div') divsElements!: QueryList<any>

  @Input() width = 320
  @Input() value!: Array<number>
  @Input() min!: number
  @Input() max!: number
  @Input() disable = false
  @Output() setValue = new EventEmitter()

  val: any = this.min
  lastX: any
  currCord: any
  newWidth: any
  pressedBtn: boolean = false
  startX: number = 0
  removeMouseMove!: Function
  removeMouseUp!: Function
  thumb1: any
  thumb2: any
  newWidth2: any

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    let [value1, value2] = this.value
    this.width = this.range(MIN_WIDTH, MAX_WIDTH, this.width)
    let tempId1 = 1
    let tempId2 = 2
    this.setinitialValue(this.validate(value1), tempId1)
    this.setinitialValue(this.validate(value2), tempId2)
  }

  ngAfterViewInit() {
    let thunsArr = this.thumbs.toArray()
    this.thumb1 = thunsArr[0].nativeElement
    this.thumb2 = thunsArr[1].nativeElement
    let divArr = this.divsElements.toArray()
    if (this.disable) {
      this.disableNodes(divArr)
    }
  }

  disableNodes(arr: any): void {
    for (let el of arr) {
      el.nativeElement.classList.add('disabled')
    }
    this.thumb1.classList.add('disabled')
    this.thumb2.classList.add('disabled')
  }

  setinitialValue(val: number, mark: number): void {
    let widthPer = val / (this.max - this.min)
    if (mark == 1) {
      this.newWidth = widthPer * this.width
    } else {
      this.newWidth2 = widthPer * this.width
    }
  }

  validate(val: number): number {
    if (val < this.min || val > this.max) {
      console.error('invalid value range !');
    }
    return this.range(this.min, this.max, val)
  }

  onMouseDown(e: any): void {
    if (this.disable || e.button != 0) {
      return
    }

    this.pressedBtn = true
    e.target.style.boxShadow = '0px 1px 8px 12px #d5c9e6'
    this.lastX = e.clientX
    let choosenThumb = e.target.id == "thumb2" ? this.thumb2 : this.thumb1
    e.preventDefault()
    this.removeMouseUp = this.renderer.listen('document', 'mouseup', this.onMouseup.bind(this))
    this.removeMouseMove = this.renderer.listen(choosenThumb, 'mousemove',
      this.mouseMove.bind(this))
  }

  onMouseup(e: any) {
    if (e.button != 0) {
      return
    }

    this.pressedBtn = false
    e.target.style.boxShadow = 'none'
    this.removeMouseMove()
    this.removeMouseUp()
  }

  mouseMove(e: any): void {
    this.startX = e.target.previousSibling.offsetWidth
    let dist = (e.clientX - this.lastX) + this.startX
    this.setNewWIdth(dist, e.target)
    this.lastX = e.clientX
  }

  increaseWidth(e: any): void {
    if (this.disable) {
      return
    }

    let rangeEl = e.target.children[0]
    if (!rangeEl) {
      return
    }

    if (!this.currCord) {
      this.currCord = rangeEl.getBoundingClientRect()
    }

    let dist = (e.clientX - this.currCord.left)
    this.setNewWIdth(dist, e.target)
  }

  decreaseWidth(e: any) {
    if (this.disable) {
      return
    }

    if (!this.currCord) {
      this.currCord = e.target.getBoundingClientRect()
    }
    let dist = e.clientX - this.currCord.left
    this.setNewWIdth(dist, this.thumb2)
  }

  setNewWIdth(dist: number, thumb: any): void {

    if (thumb == this.thumb2) {
      this.newWidth2 = this.range(0, this.newWidth, dist)
      this.calculateWidth(this.newWidth2, thumb.id)
      return
    }

    this.newWidth = this.range(this.newWidth2, this.width, dist)
    this.calculateWidth(this.newWidth, thumb.id)
  }

  calculateWidth(width: any, id: any) {
    this.val = width / this.width
    this.val = Math.trunc(this.val * (this.max - this.min)) + this.min
    this.setValue.emit({ val: this.val, id: id })
  }

  range(min: number, max: number, value: number): number {
    if (value < min) {
      return 0
    }
    if (value > max) {
      return max
    }
    return value
  }
}
