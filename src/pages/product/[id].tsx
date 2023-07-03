import { stripe } from '@/lib/stripe';
import { ImageContainer, ProductContainer, ProductDetails } from '@/styles/pages/product'
import axios from 'axios';
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import Stripe from 'stripe';

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);

      const res = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = res.data;

      window.location.href = checkoutUrl
    } catch (error) {
      setIsCreatingCheckoutSession(false);
      alert('Falaha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Gr Streetwear</title>
      </Head>

      <ProductContainer>
      <ImageContainer>
        {
          product.imageUrl &&
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        }
        
      </ImageContainer>
      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>
        <p>{product.description}</p>
        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>comprar agora</button>
      </ProductDetails>
    </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  return {
    paths: [
      { params: { id: 'prod_OCAfRuWDmhmN9h' }},
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, {id: string}> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  });

  const price =product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageURL: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}

