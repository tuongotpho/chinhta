import React, { useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Header } from './components/Header';
import { ScanControls } from './components/ScanControls';
import { ErrorList } from './components/ErrorList';
import { BatchFixModal } from './components/BatchFixModal';
import { OldFontModal } from './components/OldFontModal';
import { LayoutFixModal } from './components/LayoutFixModal';
import { UserDictionaryModal } from './components/UserDictionaryModal';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { useUserDictionary } from './hooks/useUserDictionary';
import { useChecker, isBatchEligible, isLayoutBatchEligible } from './hooks/useChecker';

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
    layoutIssues,
    isScanning,
    hasScanned,
    oldFontWarning,
    notice,
    options,
    setOptions,
    scan,
    selectInWord,
    fixError,
    ignoreError,
    dropWord,
    batchFixSure,
    convertOldFonts,
    selectLayout,
    fixLayout,
    ignoreLayout,
    batchFixLayout,
    updateSuggestion
  } = useChecker(dictWords);

  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isFixingBatch, setIsFixingBatch] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isLayoutBatchOpen, setIsLayoutBatchOpen] = useState(false);
  const [isFixingLayout, setIsFixingLayout] = useState(false);

  const sureItems = items.filter(isBatchEligible);
  const layoutBatchCount = layoutIssues.filter(isLayoutBatchEligible).length;

  const handleConfirmBatch = async () => {
    setIsFixingBatch(true);
    try {
      await batchFixSure();
      setIsBatchOpen(false);
    } finally {
      setIsFixingBatch(false);
    }
  };

  const handleConfirmLayoutBatch = async () => {
    setIsFixingLayout(true);
    try {
      await batchFixLayout();
      setIsLayoutBatchOpen(false);
    } finally {
      setIsFixingLayout(false);
    }
  };

  const handleConfirmConvert = async () => {
    setIsConverting(true);
    try {
      await convertOldFonts();
      setIsConvertOpen(false);
    } finally {
      setIsConverting(false);
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
          onOpenConvertModal={() => setIsConvertOpen(true)}
          sureCount={sureItems.length}
          oldFontWarning={oldFontWarning}
          notice={notice}
          hasScanned={hasScanned}
          options={options}
          onOptionsChange={setOptions}
        />

        <main className="main-content">
          <ErrorList
            items={items}
            layoutIssues={layoutIssues}
            layoutBatchCount={layoutBatchCount}
            onOpenLayoutBatch={() => setIsLayoutBatchOpen(true)}
            onSelectLayout={selectLayout}
            onFixLayout={fixLayout}
            onIgnoreLayout={ignoreLayout}
            hasScanned={hasScanned}
            onSelect={selectInWord}
            onFix={(item, sug) => fixError(item, sug)}
            onIgnore={ignoreError}
            onAddToDict={(w) => { addWord(w); dropWord(w); }}
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

        <LayoutFixModal
          open={isLayoutBatchOpen}
          onOpenChange={setIsLayoutBatchOpen}
          count={layoutBatchCount}
          onConfirm={handleConfirmLayoutBatch}
          isFixing={isFixingLayout}
        />

        <OldFontModal
          open={isConvertOpen}
          onOpenChange={setIsConvertOpen}
          onConfirm={handleConfirmConvert}
          isConverting={isConverting}
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
