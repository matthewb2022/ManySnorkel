import React, { useEffect, useState } from "react";
import Head from 'next/head';

import styles from "components/Home/Home.module.css"
import SearchBar from "components/SearchBar"
import Layout from 'components/Layout/Layout';
import Carousel from "components/Carousel/Carousel"
import { rootDomain } from "src/lib/constants";
import Banner from "components/EmailBanner";
import Cookies from "js-cookie";
import { sendEvent } from 'hooks/amplitude';
import { useCurrentUser } from 'context/usercontext';

export async function getServerSideProps(context) {
  const sorts = ['top', 'latest', 'default', 'recs']
  const props = {};
  await Promise.all(sorts.map(async sort => {
    let res;
    if (sort === 'recs') {
      res = await fetch(`${rootDomain}/spots/recs`, {
        headers: context.req ? { cookie: context.req.headers.cookie } : undefined
      })
    } else {
      res = await fetch(`${rootDomain}/spots/get?sort=${sort}`,)
    }

    const data = await res.json()
    props[sort] = data.data || null;
    return data;
  }))

  if (!props.default) {
    return {
      notFound: true,
    }
  }

  return {
    props, // will be passed to the page component as props
  }
}

// '/' route
const Home = (props) => {
  const [shouldShowBanner, setShouldShowBanner] = React.useState(false);

  React.useEffect(() => {
    setShouldShowBanner(!(Cookies.get('has_seen_banner') || Cookies.get('csrf_access_token')));

    if (document.referrer.match(/^https?:\/\/([^\/]+\.)?google\.com(\/|$)/i)) {
      setShouldShowBanner(false);
    }
  }, [])

  const { state } = useCurrentUser();

  React.useEffect(() => {
    if (state.user && state.user.id) { return }
    const handleLogin = (response) => {
      if (response.credential) {
        sendEvent('google_register_success');
        fetch(`${rootDomain}/user/google_register`, {
          method: 'POST',
          body: JSON.stringify(response),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(() => {
          window.location.reload()
        })
      } else {
        sendEvent('google_register_error');
      }
    }

    const initializeGSI = () => {
      if (google) {
        google.accounts.id.initialize({
          client_id: '609299692665-bl3secuu5i4v1iumjm0kje0db1lge1ec.apps.googleusercontent.com',
          callback: handleLogin,
        });
        google.accounts.id.prompt(notification => {
          if (notification.isNotDisplayed()) {
            console.log(notification.getNotDisplayedReason())
          } else if (notification.isSkippedMoment()) {
            console.log(notification.getSkippedReason())
          } else if (notification.isDismissedMoment()) {
            console.log(notification.getDismissedReason())
          }
        });
      }
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = setTimeout(initializeGSI, 3000)
    script.async = true;
    document.querySelector('body').appendChild(script)
  }, [])

  return (
    <Layout>
      <Head>
        <meta property="og:title" content="Zentacle - Scuba and Snorkel Reviews" key="og:title" />
        <meta property="og:description" content="Search dive and snorkel spots around the world with maps, detailed reviews, and photos curated by oceans lovers like you." key="og:description" />
        <meta property="og:image" content="https://www.zentacle.com/social_background_v2.jpg" key="og:image" />
        <meta name="description" content="Search dive and snorkel spots around the world with maps, detailed reviews, and photos curated by oceans lovers like you." key="description" />
      </Head>
      <div className={styles.container}>
        <div className={styles.image}>
          <div className={styles.imageinner} style={{ 'backgroundImage': `url(\'/hero.jpg\')` }}>
            <div className={styles.pagetitle}>Find your next underwater adventure</div>
          </div>
          <div className={styles.menu}>

            <SearchBar></SearchBar>
          </div>
        </div>
        <Banner isShown={shouldShowBanner}></Banner>
        {props.recs && Object.keys(props.recs).length > 0 && <div>
          <div className={styles.carouseltitle}>Recommended Locations (Rate spots to personalize!)</div>
          <Carousel data={props.recs}></Carousel>
        </div>}
        <div>
          <div className={styles.carouseltitle}>Local Favorites in Maui</div>
          <Carousel data={props.default}></Carousel>
        </div>
        <div>
          <div className={styles.carouseltitle}>Conditions Reported Recently</div>
          <Carousel data={props.latest}></Carousel>
        </div>
        <div>
          <div className={styles.carouseltitle}>Top Rated in Maui</div>
          <Carousel data={props.top}></Carousel>
        </div>
      </div>
    </Layout>
  )
}

export default Home;
