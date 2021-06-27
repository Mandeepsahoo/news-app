import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import {
  filter,
  map,
  mergeMap,
  pluck,
  share,
  switchMap,
  toArray,
} from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";

interface OpenWeatherResponse {
  list: {
    dt_txt: string;
    main: {
      temp: number;
    };
  }[];
}

@Injectable({
  providedIn: "root",
})
export class ForecastService {
  private url = "https://api.openweathermap.org/data/2.5/forecast";

  constructor(private http: HttpClient) {}

  getForecast() {
    return this.getCurrentLocation().pipe(
      map((coords) => {
        return new HttpParams()
          .set("lat", String(coords.latitude))
          .set("lon", String(coords.longitude))
          .set("units", "metric")
          .set("appid", "cc083a7628b586dcb1d6bc986f9453d0");
      }),
      switchMap((params) =>
        this.http.get<OpenWeatherResponse>(this.url, {
          params,
        })
      ),
      pluck("list"),
      mergeMap((value) => of(...value)),
      filter((value, index) => index % 8 === 0),
      map((value) => {
        return {
          dateString: value.dt_txt,
          temp: value.main.temp,
        };
      }),
      toArray(),
      share()
    );
  }

  getCurrentLocation() {
    return new Observable<any>((observer) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position.coords);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }
}
