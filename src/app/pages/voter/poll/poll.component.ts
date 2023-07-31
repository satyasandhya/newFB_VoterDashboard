import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PollService} from 'src/app/services/poll.service';
import {NgxCsvParser, NgxCSVParserError} from 'ngx-csv-parser';
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import {ReportService} from 'src/app/services/report.service';

@Component({selector: 'app-poll', templateUrl: './poll.component.html', styleUrls: ['./poll.component.scss']})
export class PollComponent implements OnInit {

    pollForm : FormGroup;
    csvRecords : any[] = [];
    arrayofnumber : any[] = [];
    header = true;
    isLoadingOne = false;
    arrayBuffer : any;
    data : any;
    respone : any;
    responsemobile_number : any[] = [];
    concatenatedArray : any[] = [];
    uniqueN0 : any[] = [];
    arrayofstring : any;

    constructor(private pollService : PollService, private fb : FormBuilder, private ngxCsvParser : NgxCsvParser, private ReportService : ReportService) {
        this.pollForm = fb.group({
            templateName: [''],
            campaignName: [''],
             fileupload: ''
        })
    }
    ngOnInit(): void {
        // this.findpendingNumbers();
    }

    async fileChangeListener($event : any) {
        this.csvRecords = []
        console.log($event.target.files[0])
        if ($event.target.files[0].type == 'text/csv') {
            const files = await $event.srcElement.files;
            this.ngxCsvParser.parse(files[0], {
                header: this.header,
                delimiter: ','
            }).pipe().subscribe((result : any) => {
                this.csvRecords = result;
                console.log(this.csvRecords)

            }, (error : NgxCSVParserError) => {
                console.log('Error', error);
            });
        } else {
            const file = $event.target.files[0];

            let fileReader = new FileReader();
            fileReader.onload = e => {
                this.arrayBuffer = fileReader.result;
                var data = new Uint8Array(this.arrayBuffer);
                var arr = new Array();
                for (var i = 0; i != data.length; ++ i) 
                    arr[i] = String.fromCharCode(data[i]);

                var bstr = arr.join("");
                var workbook = XLSX.read(bstr, {type: "binary"});
                var first_sheet_name = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[first_sheet_name];
                console.log(XLSX.utils.sheet_to_json(worksheet, {raw: true}));
                this.csvRecords = XLSX.utils.sheet_to_json(worksheet, {raw: true})
            };
            fileReader.readAsArrayBuffer(file);
        }
    }

    uloadCsvFileData() {
        this.isLoadingOne = true;
        this.csvRecords.map((item : any) => {
            const mobileNumber = String(item.Mobile_number)
            this.arrayofnumber.push(mobileNumber);
        });
        this.isLoadingOne = false;
        this.arrayofstring = JSON.stringify(this.arrayofnumber)
        console.log(this.arrayofnumber);


        // this.respone.map((item : any) => {
        //     const number = item.mobile_number;
        //     const trimmedNo = number.substring(2);
        //     this.responsemobile_number.push(trimmedNo);
        // });
        // console.log(this.responsemobile_number);
        // this.concatenatedArray = this.responsemobile_number.concat(this.arrayofnumber);

        // console.log(this.concatenatedArray);

    }

    sendmessage() {
        const reqObj1 = {
            "camp_name" : this.pollForm.value.campaignName,
            "temp_name" : this.pollForm.value.templateName,
            "mobile_number" : this.arrayofnumber
        }
        this.pollService.insertcampdetails(reqObj1).subscribe((res : any) => {
            console.log(res)
        })


        const reqObj2 = {
            "messaging_product": "whatsapp",
            "to": this.arrayofnumber,
            "templateName": this.pollForm.value.templateName,
            "languageCode": "en"
        }
        this.isLoadingOne = true;
        this.pollService.message(reqObj2).subscribe(async (res : any) => {
            this.data = await res.data;
            console.log(res.data);
            Swal.fire({icon: "success", text: "Successfully Send Message"})
            this.isLoadingOne = false;
        }, (err) => {
            console.log(err);
            this.isLoadingOne = false
            Swal.fire({icon: "error", text: "Failed to Send Message"})
            this.isLoadingOne = false;
        })
        this.pollForm.patchValue({templateName: '', fileupload: ''})

    }

    // findpendingNumbers() {
    //     this.ReportService.responseData().subscribe((res : any) => {
    //         this.respone = res.data;

    //     });
    // }

    uniqueExcelFile() {
        for (let i = 0; i < this.concatenatedArray.length; i++) {
            if (this.concatenatedArray.indexOf(this.concatenatedArray[i]) === this.concatenatedArray.lastIndexOf(this.concatenatedArray[i])) {
                this.uniqueN0.push(this.concatenatedArray[i]);
            }
        }
        // console.log(this.concatenatedArray);
        console.log(this.uniqueN0);

        let data: any[] = [];
        if (this.uniqueN0 && Array.isArray(this.uniqueN0)) {
            for (let i = 0; i < this.uniqueN0.length; i++) {
                let generateObj: any = {};
                generateObj.Mobile_number = this.uniqueN0[i];
                data.push(generateObj);
            }
        }
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "response-1");

        XLSX.writeFile(wb, `UniqueMobileNumber.xlsx`);
    }

}
