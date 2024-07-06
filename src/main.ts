import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { Observable, of, switchMap, EMPTY, throwError } from 'rxjs';
import { map, delay, filter, tap, catchError } from 'rxjs/operators';
import 'zone.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1>CatchError position matter!</h1>
    
    <section>
      <h2>Write something to the input</h2>  
      <input [formControl]="searchControl" placeholder="write something" />

      <div class="item-wrapper">
        <div>loading:</div>
        <div>{{ searchControlLoad() }}</div>
      </div>

      <div class="item-wrapper">
        <div>error:</div>
        <div>{{ searchControlError() }}</div>
      </div>
    <section>
  `,
})
export class App implements OnInit {
  searchControl = new FormControl('', { nonNullable: true });

  searchControlError = signal(false);
  searchControlLoad = signal(false);

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        tap((x) => console.log('Search 1 value:', x)),
        filter((x) => x.length > 3),
        tap(() => {
          // set error
          this.searchControlError.set(false);
          // set loading
          this.searchControlLoad.set(true);
        }),
        switchMap(() =>
          this.mockApiRequest().pipe(
            tap(() => {
              // set error
              this.searchControlError.set(false);
              // set loading
              this.searchControlLoad.set(false);
            })
            // TODO: comment this out to see the difference
            // catchError(() => {
            //   console.log('received error - application still works');
            //   // set error
            //   this.searchControlError.set(true);
            //   // set loading
            //   this.searchControlLoad.set(false);
            //   return EMPTY;
            // })
          )
        ),
        catchError(() => {
          console.log('received error - application no longer works');
          // set error
          this.searchControlError.set(true);
          // set loading
          this.searchControlLoad.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  /**
   * mock API request with some delay
   */
  private mockApiRequest(): Observable<unknown> {
    return of({}).pipe(
      delay(3000),
      switchMap(() => throwError(() => new Error('I have failed you')))
    );
  }
}

bootstrapApplication(App);
