import React, { Fragment, useEffect, useState } from "react";
import { Alert } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";

import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = () => {
  const { logout, isAuthenticated } = useAuth0();
  const [showSignupComplete, setShowSignupComplete] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const signupComplete = urlParams.get('signup_complete');
    
    if (signupComplete === 'true' && isAuthenticated) {
      setShowSignupComplete(true);
      // URLからパラメータを除去
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // サインアップ完了後、自動的にログアウト
      setTimeout(() => {
        logout({
          logoutParams: { returnTo: window.location.origin + '/?signup_success=true' }
        });
      }, 2000);
    }
    
    // ログアウト後のサインアップ成功メッセージ
    const signupSuccess = urlParams.get('signup_success');
    if (signupSuccess === 'true' && !isAuthenticated) {
      setShowSignupComplete(true);
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setShowSignupComplete(false);
      }, 5000);
    }
  }, [isAuthenticated, logout]);

  return (
    <Fragment>
      {showSignupComplete && (
        <Alert color="success" className="text-center">
          <h4>🎉 アカウント作成完了！</h4>
          <p>新しいアカウントが正常に作成されました。下の「Log in」ボタンからログインしてください。</p>
        </Alert>
      )}
      <Hero />
      <hr />
      <Content />
    </Fragment>
  );
};

export default Home;
