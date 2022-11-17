class Account {
  id: string;

  registerDt: number;

  updateDt: number;

  name: string;

  icNumber: string;

  email: string;

  hpNumber: number;

  birthDt: string;

  add1: string;

  add2: string;

  postcode: number;

  city: string;

  state: string;

  country: string;

  file: any;

  constructor(account: any) {
    this.id = `${account.icNumber}_${account.name}`;
    this.registerDt = Date.now();
    this.updateDt = Date.now();
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
export default Account;
