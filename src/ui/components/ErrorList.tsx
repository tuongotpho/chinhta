import React, { useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  TabList,
  Tab,
  Text
} from '@fluentui/react-components';
import { CheckmarkCircleFilled } from '@fluentui/react-icons';
import { DisplayErrorItem } from '../hooks/useChecker';
import { ErrorCard } from './ErrorCard';

const useStyles = makeStyles({
  stickyTabs: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    ...shorthands.padding('6px', '0'),
    backgroundColor: tokens.colorNeutralBackground1
  },
  tabList: {
    flexWrap: 'wrap'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('32px', '16px'),
    textAlign: 'center',
    color: tokens.colorNeutralForeground3
  },
  successIcon: {
    fontSize: '48px',
    color: tokens.colorPaletteGreenForeground1,
    marginBottom: '12px'
  }
});

interface ErrorListProps {
  items: DisplayErrorItem[];
  hasScanned: boolean;
  onSelect: (item: DisplayErrorItem) => void;
  onFix: (item: DisplayErrorItem, suggestion: string) => void;
  onIgnore: (id: string) => void;
  onAddToDict: (word: string) => void;
  onUpdateSuggestion: (id: string, suggestion: string) => void;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  items,
  hasScanned,
  onSelect,
  onFix,
  onIgnore,
  onAddToDict,
  onUpdateSuggestion
}) => {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<'all' | 'chac-chan' | 'nen-xem' | 'goi-y'>('all');

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    return item.error.mucDo === activeTab;
  });

  const countSure = items.filter(i => i.error.mucDo === 'chac-chan').length;
  const countReview = items.filter(i => i.error.mucDo === 'nen-xem').length;
  const countSuggestion = items.filter(i => i.error.mucDo === 'goi-y').length;

  if (hasScanned && items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CheckmarkCircleFilled className={styles.successIcon} />
        <Text weight="semibold" size={400}>Văn bản rất chuẩn xác!</Text>
        <Text size={200}>Không phát hiện lỗi chính tả hoặc quy chuẩn nào.</Text>
      </div>
    );
  }

  if (!hasScanned) {
    return (
      <div className={styles.emptyState}>
        <Text size={300}>Bấm <strong>Quét toàn bộ</strong> hoặc chọn vùng văn bản để bắt đầu kiểm tra.</Text>
      </div>
    );
  }

  return (
    <>
      <div className={styles.stickyTabs}>
        <TabList
          className={styles.tabList}
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as typeof activeTab)}
          size="small"
        >
          <Tab value="all">Tất cả ({items.length})</Tab>
          <Tab value="chac-chan">Chắc chắn ({countSure})</Tab>
          <Tab value="nen-xem">Nên xem ({countReview})</Tab>
          {countSuggestion > 0 && <Tab value="goi-y">Gợi ý ({countSuggestion})</Tab>}
        </TabList>
      </div>

      <div>
        {filteredItems.map(item => (
          <ErrorCard
            key={item.id}
            item={item}
            onSelect={() => onSelect(item)}
            onFix={(sug) => onFix(item, sug)}
            onIgnore={() => onIgnore(item.id)}
            onAddToDict={(w) => onAddToDict(w)}
            onUpdateSuggestion={(sug) => onUpdateSuggestion(item.id, sug)}
          />
        ))}
      </div>
    </>
  );
};
