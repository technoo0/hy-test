import { MediaFile } from '@shopify/hydrogen-react';


export default function ProductGallery({ media }) {
    if (!media.length) {
        return null;
    }

    const typeNameMap = {
        VIDEO: 'Video',
        IMAGE: 'MediaImage',
        EXTERNAL_VIDEO: 'ExternalVideo',
    };

    return (
        <div
            className={`grid gap-4 overflow-x-scroll grid-flow-col md:grid-flow-row  md:p-0 md:overflow-x-auto md:grid-cols-2 w-[90vw] md:w-full lg:col-span-2`}
        >
            {media.map((med, i) => {
                let extraProps = {};



                const data = {
                    ...med,
                    __typename: typeNameMap[med.mediaContentType] || typeNameMap['IMAGE'],
                    image: {
                        ...med.image,
                        altText: med.alt || 'Product image',
                    },
                };

                return (
                    <div
                        className={`${i % 3 === 0 ? 'md:col-span-2' : 'md:col-span-1'
                            } snap-center card-image bg-white aspect-square md:w-full w-[80vw] shadow-sm rounded`}
                        key={data.id || data.image.id}
                    >
                        <MediaFile
                            tabIndex="0"
                            className={`w-full h-full aspect-square object-cover`}
                            data={data}
                            {...extraProps}
                        />
                    </div>
                );
            })}
        </div>
    );
}
