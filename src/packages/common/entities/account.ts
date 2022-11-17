class Account {
  id: string;

  registerDt: number;

  createdDt: number;

  updateDt: number;

  name: string;

  icNumber: string;

  email: string;

  hpNumber: number;

  birthDt: string;

  address1: string;

  address2: string;

  postcode: number;

  city: string;

  state: string;

  country: string;

  file: any;

  constructor(account: any) {
    this.id = `${account.icNumber}_${account.name}`;
    this.registerDt = Date.now();
    this.createdDt = Date.now();
    this.updateDt = Date.now();
    this.name = account.name;
    this.icNumber = account.icNumber;
    this.email = account.email;
    this.hpNumber = account.hpNumber;
    this.birthDt = account.birthDt;
    this.address1 = account.address1;
    this.address2 = account.address2;
    this.postcode = account.postcode;
    this.city = account.city;
    this.state = account.state;
    this.country = account.country;
    this.file = account.file;
  }
}
export default Account;
