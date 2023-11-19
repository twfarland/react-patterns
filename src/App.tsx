import { Layout } from "./components/Layout";

function App() {
  return (
    <Layout
      header={({ headerHeightPercent }) => (
        <>
          <h1
            style={{
              fontSize: `${Math.max(30, (headerHeightPercent / 100) * 50)}px`,
              // example of dynamic styling using layout state passed in as props
            }}
          >
            Title
            {headerHeightPercent}%
          </h1>
        </>
      )}
      sidebar={() => <div>sidebar</div>}
    >
      {() => (
        <div style={{ padding: 20 }}>
          {[...Array(100)].map((_, index) => (
            <p key={index}>main content line main content line</p>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default App;
