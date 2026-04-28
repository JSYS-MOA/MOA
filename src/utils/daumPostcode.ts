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

const DAUM_POSTCODE_SCRIPT_SRC =
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const DAUM_POSTCODE_SCRIPT_SELECTOR = 'script[data-daum-postcode="true"]';

let daumPostcodeScriptPromise: Promise<DaumPostcodeConstructor> | null = null;

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

const loadDaumPostcode = () => {
    const Postcode = (window as DaumWindow).daum?.Postcode;

    if (Postcode) {
        return Promise.resolve(Postcode);
    }

    if (daumPostcodeScriptPromise) {
        return daumPostcodeScriptPromise;
    }

    daumPostcodeScriptPromise = new Promise<DaumPostcodeConstructor>((resolve, reject) => {
        const resolvePostcode = () => {
            const loadedPostcode = (window as DaumWindow).daum?.Postcode;

            if (!loadedPostcode) {
                daumPostcodeScriptPromise = null;
                reject(new Error("Daum Postcode service is unavailable."));
                return;
            }

            resolve(loadedPostcode);
        };

        const rejectPostcode = () => {
            daumPostcodeScriptPromise = null;
            reject(new Error("Failed to load Daum Postcode script."));
        };

        const existingScript = document.querySelector(
            DAUM_POSTCODE_SCRIPT_SELECTOR
        ) as HTMLScriptElement | null;

        if (existingScript) {
            if (existingScript.dataset.loaded === "true") {
                resolvePostcode();
                return;
            }

            if (existingScript.dataset.loadFailed === "true") {
                rejectPostcode();
                return;
            }

            existingScript.addEventListener("load", resolvePostcode, { once: true });
            existingScript.addEventListener("error", rejectPostcode, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = DAUM_POSTCODE_SCRIPT_SRC;
        script.async = true;
        script.dataset.daumPostcode = "true";
        script.addEventListener(
            "load",
            () => {
                script.dataset.loaded = "true";
                resolvePostcode();
            },
            { once: true }
        );
        script.addEventListener(
            "error",
            () => {
                script.dataset.loadFailed = "true";
                rejectPostcode();
            },
            { once: true }
        );
        document.head.appendChild(script);
    });

    return daumPostcodeScriptPromise;
};

export const openDaumPostcode = async () => {
    const Postcode = await loadDaumPostcode();

    return new Promise<string>((resolve) => {
        new Postcode({
            oncomplete: (data) => {
                resolve(formatAddress(data));
            },
        }).open();
    });
};
