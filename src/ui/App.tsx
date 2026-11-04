import React, { useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Header } from './components/Header';
import { ScanControls } from './components/ScanControls';
import { ErrorList } from './components/ErrorList';
import { BatchFixModal } from './components/BatchFixModal';
import { UserDictionaryModal } from './components/UserDictionaryModal';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { useUserDictionary } from './hooks/useUserDictionary';
import { useChecker } from './hooks/useChecker';

export const App: React.FC = () => {
  const {
    words: dictWords,
    addWord,
    removeWord,
    exportToFile,
    importFromFile
  } = useUserDictionary();

  const {
    items,
    isScanning,
    hasScanned,
    oldFontWarning,
    scan,
    selectInWord,
    fixError,
    ignoreError,
    batchFixSure,
    updateSuggestion
  } = useChecker(dictWords);

  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isFixingBatch, setIsFixingBatch] = useState(false);

  const sureItems = items.filter(i => i.error.mucDo === 'chac-chan');

  const handleConfirmBatch = async () => {
    setIsFixingBatch(true);
    try {
      await batchFixSure();
      setIsBatchOpen(false);
    } finally {
      setIsFixingBatch(false);
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app-container">
        <Header
          onOpenDict={() => setIsDictOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          dictCount={dictWords.length}
        />

        <ScanControls
          isScanning={isScanning}
          onScanAll={() => scan('all')}
          onScanSelection={() => scan('selection')}
          onOpenBatchModal={() => setIsBatchOpen(true)}
          sureCount={sureItems.length}
          oldFontWarning={oldFontWarning}
        />

        <main className="main-content">
          <ErrorList
            items={items}
            hasScanned={hasScanned}
            onSelect={selectInWord}
            onFix={(item, sug) => fixError(item, sug)}
            onIgnore={ignoreError}
            onAddToDict={(w) => addWord(w)}
            onUpdateSuggestion={updateSuggestion}
          />
        </main>

        <Footer />

        <BatchFixModal
          open={isBatchOpen}
          onOpenChange={setIsBatchOpen}
          count={sureItems.length}
          onConfirm={handleConfirmBatch}
          isFixing={isFixingBatch}
        />

        <UserDictionaryModal
          open={isDictOpen}
          onOpenChange={setIsDictOpen}
          words={dictWords}
          onAddWord={addWord}
          onRemoveWord={removeWord}
          onExport={exportToFile}
          onImport={importFromFile}
        />

        <AboutModal
          open={isAboutOpen}
          onOpenChange={setIsAboutOpen}
        />
      </div>
    </FluentProvider>
  );
};
