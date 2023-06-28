import { useLoaderData } from '@remix-run/react';
import { Money, ShopPayButton } from '@shopify/hydrogen';
import { json } from '@shopify/remix-oxygen';
import ProductForm from '~/components/ProductForm';
import ProductGallery from '~/components/ProductGallery';
import ProductOptions from '~/components/ProductOptions';


export function meta({ data }) {

    return [
        { title: data?.product?.title },
        { description: data?.product?.description.substr(0, 154) },
    ];
}

const seo = ({ data }) => ({
    title: data?.product?.title,
    description: data?.product?.description.substr(0, 154),
});

export const handle = {
    seo,
    meta
};


export async function loader({ params, context, request }) {// query the graphql for the product 
    const { handle } = params; // the product id/ handle
    const searchParams = new URL(request.url).searchParams; // create new Url for the options params
    const selectedOptions = [];

    // get the Store Domain for the shop pay buttom
    const storeDomain = context.storefront.getShopifyDomain();


    // set selected options from the query string
    searchParams.forEach((value, name) => {
        selectedOptions.push({ name, value });
    });

    const { product } = await context.storefront.query(PRODUCT_QUERY, { //run the query
        variables: {
            handle, // the id
            selectedOptions, // the search params 
        },
    });

    if (!product?.id) {// it there is no product return 404
        throw new Response(null, { status: 404 });
    }

    // optionally set a default variant so you always have an "orderable" product selected
    const selectedVariant =
        product.selectedVariant ?? product?.variants?.nodes[0];

    return json({// convert the query result to json 
        product,
        selectedVariant,
        storeDomain
    });
}



export default function ProductHandle() {
    const { product, selectedVariant, storeDomain } = useLoaderData();
    console.log("marawan fouda", selectedVariant.availableForSale)
    // check if the item is in Stock
    const orderable = selectedVariant?.availableForSale || false;

    return (
        <section className="w-full gap-4 md:gap-8 grid px-6 md:px-8 lg:px-12">
            <div className="grid items-start gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
                <div className="grid md:grid-flow-row  md:p-0 md:overflow-x-hidden md:grid-cols-2 md:w-full lg:col-span-2">
                    <div className="md:col-span-2 snap-center card-image aspect-square md:w-full w-[80vw] shadow rounded">
                        <ProductGallery media={product.media.nodes} />

                    </div>
                </div>
                <div className="md:sticky md:mx-auto max-w-xl md:max-w-[24rem] grid gap-8 p-0 md:p-6 md:px-0 top-[6rem] lg:top-[8rem] xl:top-[10rem]">
                    <div className="grid gap-2">
                        <h1 className="text-4xl font-bold leading-10 whitespace-normal">
                            {product.title}
                        </h1>
                        <span className="max-w-prose whitespace-pre-wrap inherit text-copy opacity-50 font-medium">
                            {product.vendor}
                        </span>
                    </div>
                    <ProductOptions options={product.options} selectedVariant={selectedVariant} />
                    <Money
                        withoutTrailingZeros
                        data={selectedVariant.price}
                        className="text-xl font-semibold mb-2"
                    />
                    {orderable && (
                        <div className="space-y-2">
                            <ShopPayButton
                                storeDomain={storeDomain}
                                variantIds={[selectedVariant?.id]}
                                width={'400px'}
                            />
                            <ProductForm variantId={selectedVariant?.id} />
                        </div>
                    )}
                    <div
                        className="prose border-t border-gray-200 pt-6 text-black text-md"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    ></div>
                </div>
            </div>
        </section>
    );
}



const PRODUCT_QUERY = `#graphql
  query product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      description
      descriptionHtml
      media(first: 10) {
        nodes {
          ... on MediaImage {
            mediaContentType
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Model3d {
            id
            mediaContentType
            sources {
              mimeType
              url
            }
          }
        }
      }
      options {
        name,
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          id
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        sku
        title
        unitPrice {
          amount
          currencyCode
        }
        product {
          title
          handle
        }
      }
      variants(first: 1) {
        nodes {
          id
          title
          availableForSale
          price {
            currencyCode
            amount
          }
          compareAtPrice {
            currencyCode
            amount
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

