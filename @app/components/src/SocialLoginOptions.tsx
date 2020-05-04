import {
  GithubOutlined,
  GoogleOutlined,
  FacebookFilled,
} from "@ant-design/icons";

import { Button } from "antd";
import React from "react";

export interface SocialLoginOptionsProps {
  next: string;
  buttonTextFromService?: (service: string) => string;
}

function defaultButtonTextFromService(service: string) {
  return `Sign in with ${service}`;
}

export function SocialLoginOptions({
  next,
  buttonTextFromService = defaultButtonTextFromService,
}: SocialLoginOptionsProps) {
  console.log("SocialLoginOptions");
  console.log(next);
  return (
    <div>
      <div style={{ marginBottom: 8, backgroundColor: "black" }}>
        <Button
          block
          size="large"
          icon={<GithubOutlined />}
          href={`/auth/github?next=${encodeURIComponent(next)}`}
          ghost
        >
          {buttonTextFromService("Github")}
        </Button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Button
          block
          size="large"
          icon={<FacebookFilled />}
          href={`/auth/facebook?next=${encodeURIComponent(next)}`}
          type="primary"
        >
          {buttonTextFromService("Facebook")}
        </Button>
      </div>

      <Button
        block
        size="large"
        icon={<GoogleOutlined />}
        href={`/auth/google?next=${encodeURIComponent(next)}`}
        type="primary"
        danger
      >
        {buttonTextFromService("Google")}
      </Button>
    </div>
  );
}
