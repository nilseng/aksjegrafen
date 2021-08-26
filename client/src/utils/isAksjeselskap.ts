import { IShareholder } from "../models/models"

export const isAksjeselskap = (shareholder?: IShareholder) => {
    return shareholder?.orgnr &&
        (shareholder?.name.includes(" AS") ||
            shareholder?.name
                .toLowerCase()
                .includes("aksjeselskap"))
}