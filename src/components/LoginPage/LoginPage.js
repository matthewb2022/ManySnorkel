import Layout from "../Layout/Layout";
import BackgroundCard from "../Layout/BackgroundCard/BackgroundCard";
import styles from "../LoginPage/LoginPage.module.css";
import Link from "next/link";

const LoginButton = () => {
    return (
        <div className={styles.buttonwrapper}>
            <div className={styles.loginbutton}>
                Login
            </div>
        </div>
    )
}

const InputArea = ({ type }) => {
    return (
        <div className={styles.outerinput}>
            <input className={styles.inputs} placeholder={type}></input>
        </div>
    )
}

const Title = () => {
    return (
        <div className={styles.titlecontainer}>
            Login to your account
        </div>
    )
}

const LoginPage = () => {
    return (
        <Layout>
            <BackgroundCard>
                <Title>
                </Title>
                <br />
                <br />
                <InputArea type="Email"></InputArea>
                <br />

                <InputArea type="Password"></InputArea>
                <br />
                <LoginButton></LoginButton>
                <br />
                <div className={styles.bottominfo}>
                    Don't have an account?&nbsp;
                    <Link href="/createaccount">
                        <span className={styles.createone}>
                            Create one!
                        </span>
                    </Link>
                </div>
            </BackgroundCard>
        </Layout>
    )
}

export default LoginPage;