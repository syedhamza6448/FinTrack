import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AiService {
    private base = `${environment.apiUrl}/ai`;

    constructor(private http: HttpClient) { }

    // Feature 5 Chat
    chat(message: string, history: { role: string; text: string }[]) {
        return this.http.post<{ reply: string }>(`${this.base}/chat`, { message, history });
    }

    // Feature 6 Natural Language
    parseTransaction(text: string) {
        return this.http.post<any>(`${this.base}/parse-transaction`, { text });
    }

    getMonthlyReport(month: number, year: number) {
        return this.http.get<{ month: string; report: string }>(
            `${this.base}/monthly-report`, { params: { month, year } }
        );
    }

    // Feature 13 Receipt Scanner
    scanReceipt(formData: FormData) {
        return this.http.post<any>(`${this.base}/scan-receipt`, formData);
    }

    parseStatement(formData: FormData) {
        return this.http.post<any>(`${this.base}/parse-statement`, formData);
    }
} 