import Dexie, { type Table } from 'dexie';
import { type GearItem, type Pack } from '../types/gear';

export class EvpGearDatabase extends Dexie {
    gearItems!: Table<GearItem>;
    packs!: Table<Pack>;

    constructor() {
        super('EvpGearDatabase');
        this.version(1).stores({
            gearItems: 'id, name, brand, weightType, tagPath.tt, tagPath.mt, tagPath.bt',
            packs: 'id, packName'
        });
    }
}

export const db = new EvpGearDatabase();
