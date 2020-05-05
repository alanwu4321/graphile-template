import { projectName } from "@app/config";
import { Task } from "graphile-worker";

import { SendEmailPayload } from "./send_email";

interface UserForgotPasswordUnregisteredEmailPayload {
  email: string;
}

const task: Task = async (inPayload, helper) => {
  console.log(inPayload);
  console.log(helper);
  console.log("start waiting" + helper.job.id);
  setTimeout(() => {
    console.log("done" + helper.job.id);
  }, 5000);
  //wait till send_email is done otherwise it would be consider success regardless
  // await addJob("send_email", sendEmailPayload);
};

module.exports = task;
