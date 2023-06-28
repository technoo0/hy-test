import { Link, useLocation, useSearchParams, useNavigation } from '@remix-run/react';

export default function ProductOptions({ options, selectedVariant }) {
    // pathname and search will be used to build option URLs
    const { pathname, search } = useLocation();
    const [currentSearchParams] = useSearchParams();
    const navigation = useNavigation();

    //Check if there is Default params and applay them if so
    const paramsWithDefaults = (() => {
        const defaultParams = new URLSearchParams(currentSearchParams);
        // if there is no Pre Selected Params go with the Defult ones 
        if (!selectedVariant) {
            return defaultParams;
        }
        // if there is set them in the Defult Params 
        for (const { name, value } of selectedVariant.selectedOptions) {
            if (!currentSearchParams.has(name)) {
                defaultParams.set(name, value);
            }
        }

        return defaultParams;
    })();

    // Update the in-flight request data from the 'navigation' (if available)
    // to create an optimistic UI that selects a link before the request completes
    // Update the UI before the server even responce 
    const searchParams = navigation.location
        ? new URLSearchParams(navigation.location.search)
        : paramsWithDefaults;


    return (
        <div className="grid gap-4 mb-6">

            {/* Each option will show a label and option value <Links> */}
            {options.map((option) => {
                if (!option.values.length) {
                    return;
                }
                // get the currently selected option value
                const currentOptionVal = searchParams.get(option.name);
                return (
                    <div
                        key={option.name}
                        className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
                    >
                        <h3 className="whitespace-pre-wrap max-w-prose font-bold text-lead min-w-[4rem]">
                            {option.name}
                        </h3>

                        <div className="flex flex-wrap items-baseline gap-4">
                            {option.values.map((value) => {
                                // Build a URLSearchParams object from the current search string
                                const linkParams = new URLSearchParams(search);

                                // Check if the Current option is the selected option
                                const isSelected = currentOptionVal === value;
                                // Set the option name and value, overwriting any existing values
                                linkParams.set(option.name, value);
                                return (
                                    <Link
                                        key={value}
                                        to={`${pathname}?${linkParams.toString()}`}
                                        preventScrollReset
                                        replace
                                        className={`leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200 ${isSelected ? 'border-gray-500' : 'border-neutral-50'
                                            }`}
                                    >
                                        {value}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
