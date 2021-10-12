import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from '@app/_services/acount.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../_services/alert.service';


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})

export class OrderListComponent implements OnInit {
  orders = null;
  closeResult!: string;
  form: FormGroup;
  id: string;
  submitted = false;
  users = null;
  isAddMode: any;
  loading: boolean;

  constructor(
    private accountService: AccountService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
  }
    this.accountService.getAllOrder()
      .pipe(first())
      .subscribe(orders => this.orders = orders)

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      material: ['', Validators.required],
      color: ['', Validators.required],
      size: ['', Validators.required],

    });
    if (!this.isAddMode) {
      this.accountService.getByOrderId(this.id)
          .pipe(first())
          .subscribe(x => this.form.patchValue(x));
  }

  }

  get f() { return this.form.controls; }
  
  open(content: any) {
    this.modalService.open(content, { size: 'lg', ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.isAddMode) {
        this.createOrder();
    }
    this.modalService.dismissAll(); 
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  deleteOrder(id: string) {
    const order = this.orders.find(x => x.id === id);
    order.isDeleting = true;
    this.accountService.deleteOrder(id)
      .pipe(first())
      .subscribe(() => this.orders = this.orders.filter(x => x.id !== id));
  }

  private createOrder() {
    this.accountService.registerOrder(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Order added successfully', { keepAfterRouteChange: false });
        },
        error: error => {
            this.alertService.error(error);
            this.loading = false;
        }
      });
  }


  
}
