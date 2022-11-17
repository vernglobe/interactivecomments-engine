"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Account {
    constructor(account) {
        this.name = account.name;
        this.icNumber = account.icNumber;
        this.email = account.email;
        this.hpNumber = account.hpNumber;
        this.birthDt = account.birthDt;
        this.add1 = account.add1;
        this.add2 = account.add2;
        this.postcode = account.postcode;
        this.city = account.city;
        this.state = account.state;
        this.country = account.country;
        this.file = account.file;
    }
}
exports.default = Account;
