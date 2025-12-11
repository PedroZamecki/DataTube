import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "DataTube <contato@datatube.com.br>",
      to: "test@datatube.com.br",
      subject: "Subject test 1",
      text: "Body test 1",
    });

    await email.send({
      from: "DataTube <contato@datatube.com.br>",
      to: "test@datatube.com.br",
      subject: "Subject test 2",
      text: "Body test 2",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@datatube.com.br>");
    expect(lastEmail.recipients[0]).toBe("<test@datatube.com.br>");
    expect(lastEmail.subject).toBe("Subject test 2");
    expect(lastEmail.text).toBe("Body test 2\n");
  });
});
