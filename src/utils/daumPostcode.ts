type DaumPostcodeSearchResult = {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
};

type DaumPostcodeInstance = {
    open: () => void;
};

type DaumPostcodeConstructor = new (options: {
    oncomplete: (data: DaumPostcodeSearchResult) => void;
}) => DaumPostcodeInstance;

type DaumWindow = Window &
    typeof globalThis & {
        daum?: {
            Postcode?: DaumPostcodeConstructor;
        };
    };

const formatAddress = (data: DaumPostcodeSearchResult) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
        if (data.bname) {
            extraAddress += data.bname;
        }

        if (data.buildingName) {
            extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
        }

        if (extraAddress) {
            fullAddress += ` (${extraAddress})`;
        }
    }

    return fullAddress;
};

export const openDaumPostcode = () =>
    new Promise<string>((resolve, reject) => {
        const Postcode = (window as DaumWindow).daum?.Postcode;

        if (!Postcode) {
            reject(new Error("Daum Postcode service is unavailable."));
            return;
        }

        new Postcode({
            oncomplete: (data) => {
                resolve(formatAddress(data));
            },
        }).open();
    });
