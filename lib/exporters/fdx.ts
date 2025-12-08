import { Screenplay, ScreenplayElement, ScreenplayElementType } from '@/types/screenplay';

/**
 * Convert screenplay to Final Draft XML (.fdx) format
 */
export function toFDX(screenplay: Screenplay): string {
  const elements = screenplay.elements.map(elem => elementToXML(elem)).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
    <TitlePage>
      <Content>
        <Paragraph Alignment="Center" Type="Title">
          <Text>${escapeXML(screenplay.title)}</Text>
        </Paragraph>
        ${screenplay.author ? `
        <Paragraph Alignment="Center" Type="Author">
          <Text>Written by</Text>
        </Paragraph>
        <Paragraph Alignment="Center" Type="Author">
          <Text>${escapeXML(screenplay.author)}</Text>
        </Paragraph>
        ` : ''}
        ${screenplay.contact ? `
        <Paragraph Alignment="Left" Type="Contact">
          <Text>${escapeXML(screenplay.contact)}</Text>
        </Paragraph>
        ` : ''}
        ${screenplay.draftNumber ? `
        <Paragraph Alignment="Right" Type="Draft">
          <Text>${escapeXML(screenplay.draftNumber)}</Text>
        </Paragraph>
        ` : ''}
      </Content>
    </TitlePage>
    ${elements}
  </Content>
  <HeaderAndFooter FooterFirstPage="No" FooterVisible="Yes" HeaderFirstPage="No" HeaderVisible="Yes" StartingPage="1">
    <Header>
      <Paragraph>
        <Text></Text>
      </Paragraph>
    </Header>
    <Footer>
      <Paragraph>
        <DynamicLabel Type="Page #"/>
        <Text>.</Text>
      </Paragraph>
    </Footer>
  </HeaderAndFooter>
  <SpellCheckIgnoreLists>
    <IgnoredRanges/>
    <IgnoredWords/>
  </SpellCheckIgnoreLists>
  <PageLayout BackgroundColor="#FFFFFFFFFFFF" BottomMargin="72" BreakDialogueAndActionAtSentences="Yes" DocumentLeading="Normal" FooterMargin="36" ForegroundColor="#000000000000" HeaderMargin="36" InvisiblesColor="#A0A0A0A0A0A0" LeftMargin="108" PageHeight="792" PageWidth="612" RightMargin="72" TopMargin="72" UsesSmartQuotes="Yes"/>
  <WindowState Height="768" Left="100" Mode="Normal" Top="100" Width="1024"/>
  <TextState Scaling="100" Selection="0,0"/>
</FinalDraft>`;
}

function elementToXML(element: ScreenplayElement): string {
  const type = fdxElementType(element.type);
  const content = escapeXML(element.content);
  
  // Scene heading with scene number
  if (element.type === 'scene_heading' && element.sceneNumber) {
    return `    <Paragraph Number="${element.sceneNumber}" Type="${type}">
      <SceneProperties Title="${content}"/>
      <Text>${content}</Text>
    </Paragraph>`;
  }
  
  return `    <Paragraph Type="${type}">
      <Text>${content}</Text>
    </Paragraph>`;
}

function fdxElementType(type: ScreenplayElementType): string {
  const mapping: Record<ScreenplayElementType, string> = {
    scene_heading: 'Scene Heading',
    action: 'Action',
    character: 'Character',
    dialogue: 'Dialogue',
    parenthetical: 'Parenthetical',
    transition: 'Transition',
    shot: 'Shot',
    text: 'General',
  };
  return mapping[type] || 'Action';
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

