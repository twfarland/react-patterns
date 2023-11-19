import { useMemo, useState } from "react";
import classnames from "classnames";
import styles from "./Layout.module.css";

interface LayoutState {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  headerHeight: number;
  headerHeightPercent: number;
}

interface HeaderTransitionConfig {
  startTransition: number;
  endTransition: number;
  minHeight: number;
  maxHeight: number;
}

// The props are a set of content slots. We pass the layout state to all of them in case they are interested.
interface LayoutProps {
  headerTransitionConfig?: HeaderTransitionConfig;
  header: (state: LayoutState) => React.ReactNode;
  sidebar: (state: LayoutState) => React.ReactNode;
  children: (state: LayoutState) => React.ReactNode;
}

export function Layout({
  headerTransitionConfig = defaultHeaderTransitionConfig(),
  header,
  sidebar,
  children,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // can use local storage to persist
  const [yScrollOffset, setYScrollOffset] = useState(0);

  const headerHeight = getHeaderHeight(yScrollOffset, headerTransitionConfig);
  const headerHeightMemo = useMemo(() => headerHeight, [headerHeight]); // memoize to prevent re-render - most of the time it is not changing
  const headerHeightPx = `${headerHeightMemo}px`;

  const layoutState: LayoutState = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      headerHeight: headerHeightMemo,
      headerHeightPercent:
        // current height as a percentage of the max
        ((headerHeightMemo - headerTransitionConfig.minHeight) /
          (headerTransitionConfig.maxHeight -
            headerTransitionConfig.minHeight)) *
        100,
    }),
    [isSidebarOpen, setIsSidebarOpen, headerHeightMemo, headerTransitionConfig]
  );

  return (
    <div
      className={styles.layout}
      onScroll={(event) => {
        const newPosition = event.currentTarget.scrollTop;
        setYScrollOffset(newPosition);
      }}
    >
      <header className={styles.header} style={{ height: headerHeightPx }}>
        {header(layoutState)}
      </header>
      <SidebarSlot layoutState={layoutState} sidebar={sidebar} />
      <MainSlot layoutState={layoutState} main={children} />
    </div>
  );
}

function SidebarSlot({
  layoutState,
  sidebar,
}: {
  layoutState: LayoutState;
  sidebar: (state: LayoutState) => React.ReactNode;
}) {
  const { isSidebarOpen, setIsSidebarOpen, headerHeight } = layoutState;
  return (
    <div
      className={classnames([
        styles.sidebar,
        isSidebarOpen ? styles.open : styles.closed,
      ])}
      style={{
        paddingTop: `${headerHeight}px`,
      }}
      onClick={() => {
        !isSidebarOpen && setIsSidebarOpen(true); // clicking whole sidebar when closed opens it
      }}
    >
      <div className={styles.sidebarToggle}>
        {isSidebarOpen ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setIsSidebarOpen(false);
            }}
          >
            close
          </button>
        ) : (
          <button>open</button>
        )}
      </div>
      {sidebar(layoutState)}
    </div>
  );
}

function MainSlot({
  layoutState,
  main,
}: {
  layoutState: LayoutState;
  main: (state: LayoutState) => React.ReactNode;
}) {
  return (
    <div
      className={styles.content}
      style={{
        paddingTop: `${layoutState.headerHeight}px`,
      }}
    >
      {main(layoutState)}
    </div>
  );
}

// The constants could be parameterized as props if you wanted to make this more flexible
function getHeaderHeight(
  scrollPosition: number,
  {
    startTransition,
    endTransition,
    minHeight,
    maxHeight,
  }: HeaderTransitionConfig
) {
  if (scrollPosition < startTransition) return maxHeight;
  if (scrollPosition > endTransition) return minHeight;

  // Linear interpolation between maxHeight and minHeight
  const progress =
    (scrollPosition - startTransition) / (endTransition - startTransition);
  return maxHeight - progress * (maxHeight - minHeight);
}

function defaultHeaderTransitionConfig(): HeaderTransitionConfig {
  return {
    startTransition: 200,
    endTransition: 400,
    minHeight: 50,
    maxHeight: 100,
  };
}
