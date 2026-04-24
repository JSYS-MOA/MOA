const DAUM_POSTCODE_SCRIPT_ID = "daum-postcode-script";
const DAUM_POSTCODE_SCRIPT_SRC =
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const DAUM_POSTCODE_LOAD_ERROR_MESSAGE = "주소 검색 서비스를 불러오지 못했습니다.";

type AddressSearchResult = {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
};

type DaumPostcodeInstance = {
    open: () => void;
};

type DaumPostcodeConstructor = new (options: {
    oncomplete: (data: AddressSearchResult) => void;
    onclose?: () => void;
}) => DaumPostcodeInstance;

declare global {
    interface Window {
        daum?: {
            Postcode?: DaumPostcodeConstructor;
        };
    }
}

let daumPostcodeScriptPromise: Promise<DaumPostcodeConstructor> | null = null;

const getDaumPostcodeConstructor = () => window.daum?.Postcode;

const formatAddress = (data: AddressSearchResult) => {
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

const loadDaumPostcodeScript = (): Promise<DaumPostcodeConstructor> => {
    const postcodeConstructor = getDaumPostcodeConstructor();

    if (postcodeConstructor) {
        return Promise.resolve(postcodeConstructor);
    }

    if (daumPostcodeScriptPromise) {
        return daumPostcodeScriptPromise;
    }

    daumPostcodeScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById(
            DAUM_POSTCODE_SCRIPT_ID
        ) as HTMLScriptElement | null;

        const resolvePostcode = () => {
            const loadedConstructor = getDaumPostcodeConstructor();

            if (!loadedConstructor) {
                daumPostcodeScriptPromise = null;
                reject(new Error(DAUM_POSTCODE_LOAD_ERROR_MESSAGE));
                return;
            }

            resolve(loadedConstructor);
        };

        const rejectPostcode = () => {
            daumPostcodeScriptPromise = null;
            reject(new Error(DAUM_POSTCODE_LOAD_ERROR_MESSAGE));
        };

        if (existingScript) {
            existingScript.addEventListener("load", resolvePostcode, { once: true });
            existingScript.addEventListener("error", rejectPostcode, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = DAUM_POSTCODE_SCRIPT_ID;
        script.src = DAUM_POSTCODE_SCRIPT_SRC;
        script.async = true;
        script.addEventListener("load", resolvePostcode, { once: true });
        script.addEventListener("error", rejectPostcode, { once: true });
        document.head.appendChild(script);
    });

    return daumPostcodeScriptPromise;
};

export const openDaumPostcode = async (): Promise<string | null> => {
    const Postcode = await loadDaumPostcodeScript();

    return new Promise((resolve) => {
        let isCompleted = false;

        new Postcode({
            oncomplete: (data) => {
                isCompleted = true;
                resolve(formatAddress(data));
            },
            onclose: () => {
                if (!isCompleted) {
                    resolve(null);
                }
            },
        }).open();
    });
};
