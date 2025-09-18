import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DynamicStatus />
    </>
  );
}

function convertSnakeCase(snakeCase) {
  return snakeCase
    .split("_")
    .map((word) => word[0].toLocaleUpperCase() + word.slice(1))
    .join(" ");
}

function convertObjectToTree(object, key) {
  const value = object[key];
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime()) && dateValue.toISOString() === value)
    return (
      <>
        <b>{convertSnakeCase(key)}: </b>
        {dateValue.toLocaleString()}
      </>
    );

  return value instanceof Object ? (
    <>
      <b>{convertSnakeCase(key)}:</b>
      <ul>
        {Object.keys(value).map((otherKey) => (
          <li key={otherKey}>{convertObjectToTree(value, otherKey)}</li>
        ))}
      </ul>
    </>
  ) : (
    <>
      <b>{convertSnakeCase(key)}: </b>
      {value}
    </>
  );
}

function DynamicStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  return isLoading ? (
    "Loading..."
  ) : (
    <>
      {Object.keys(data).map((key) => (
        <p key={key}>{convertObjectToTree(data, key)}</p>
      ))}
    </>
  );
}
