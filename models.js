//Blatt 07; 01:
class Entity {
  constructor(pId, pTitle, pShortDescription, pLongDescription) {
    this.id = pId;
    this.title = pTitle;
    this.shortDescription =
      pShortDescription.length <= 255
        ? pShortDescription
        : pShortDescription.slice(0, 255);
    this.longDescription = pLongDescription;
  }

  get title() {
    return this._title;
  }

  set title(val) {
    if (typeof val !== "string") throw new Error("Title must be a string");
    this._title = val;
  }

  get shortDescription() {
    return this._shortDescription;
  }

  set shortDescription(val) {
    if (val.length > 255)
      throw new Error("Short description must be ≤ 255 characters");
    this._shortDescription = val;
  }

  set longDescription(desc){
    this._longDescription = desc;
  }

  get longDescription(){
    return this._longDescription;
  }
}

class Projekt extends Entity {
  constructor(
    id,
    title,
    shortDescription,
    longDescription,
    logoUrl,
    startDate,
    endDate,
    contactInfo
  ) {
    super(id, title, shortDescription, longDescription);
    this.logoUrl = logoUrl;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.contactInfo = contactInfo;
    this.datenquellen = [];
  }

  addDatenquelle(dq) {
    if (!this.datenquellen.includes(dq)) {
      this.datenquellen.push(dq);
      dq.addProjekt(this);
    }
  }

  getRestlaufzeit() {
    const currentDate = new Date();
    const timeDiff = this.endDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
}

class Datenquelle extends Entity {
  constructor(
    id,
    title,
    shortDescription,
    longDescription,
    updateDate,
    descriptionUrl,
    apiUrl,
    license,
    statusCode
  ) {
    super(id, title, shortDescription, longDescription);
    this.updateDate = new Date(updateDate);
    this.descriptionUrl = descriptionUrl;
    this.apiUrl = apiUrl;
    this.license = license;
    this.statusCode = statusCode;
    this.projekte = [];
    this.datensaetze = [];
  }

  addProjekt(projekt) {
    if (!this.projekte.includes(projekt)) {
      this.projekte.push(projekt);
      projekt.addDatenquelle(this);
    }
  }

  addDatensatz(ds) {
    if (!this.datensaetze.includes(ds)) {
      this.datensaetze.push(ds);
    }
  }
}

class Datensatz {
  constructor(id, latitude, longitude) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.attributes = {};
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
  }

  getAttribute(key) {
    return this.attributes[key];
  }
}

//Blatt 07; 02:
class ObjectManager {
  constructor(pType) {
    this.type = pType;
    this.items = [];
  }

  add(item) {
    if (!(item instanceof this.type)) {
      throw new Error(`Nur Instanzen von ${this.type.name} erlaubt.`);
    }
    this.items.push(item);
  }

  sortiereNach(attribut, absteigend = false) {
    this.items.sort((a, b) => {
      let valA = this._getSortValue(a, attribut);
      let valB = this._getSortValue(b, attribut);

      if (valA < valB) return absteigend ? 1 : -1;
      if (valA > valB) return absteigend ? -1 : 1;
      return 0;
    });
  }

  _getSortValue(obj, attribut) {
    if (
      attribut === "restlaufzeit" &&
      typeof obj.getRestlaufzeit === "function"
    ) {
      return obj.getRestlaufzeit();
    }
    if (attribut === "anzahlDatenquellen" && obj.datenquellen) {
      return obj.datenquellen.length;
    }
    return obj[attribut];
  }

  suche(attribut, wert) {
    return this.items.filter((item) => {
      const attrValue =
        attribut === "restlaufzeit"
          ? item.getRestlaufzeit?.()
          : attribut === "anzahlDatenquellen"
          ? item.datenquellen?.length
          : item[attribut];

      if (typeof attrValue === "string") {
        return attrValue.toLowerCase().includes(String(wert).toLowerCase());
      }
      return attrValue === wert;
    });
  }

  getAll() {
    return this.items;
  }
}

export { Entity, Projekt, Datenquelle, Datensatz, ObjectManager };
