import {ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {Clipboard} from "@angular/cdk/clipboard";
import {PageHtmlService} from './PageHtmlService';
import {NgClass} from '@angular/common';

interface TextStateInterface {
  clickable: boolean;
  text: 'Save' | 'Done!' | 'Not found!'
}

const COPY_TIMEOUT_DELAY: number = 1_000;

const copyState: TextStateInterface = {
  clickable: true,
  text: 'Save',
};

const doneState: TextStateInterface = {
  clickable: false,
  text: 'Done!',
};

const errorState: TextStateInterface = {
  clickable: false,
  text: 'Not found!',
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [Clipboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass
  ]
})
export class AppComponent {
  constructor(
    private readonly clipboard: Clipboard,
    private pageHtmlService: PageHtmlService,
  ) {}

  public readonly textState: WritableSignal<TextStateInterface> = signal(copyState);

  public async click(): Promise<void> {
    if (!this.textState().clickable) {
      return;
    }

    try {
      const html = await this.pageHtmlService.getHtml();
      const scenarioList = this.findScenarios(new DOMParser().parseFromString(html, 'text/html'));
      const convertedScenarios = this.convertScenarios(scenarioList || []);

      this.clipboard.copy(convertedScenarios);
      this.textState.set(doneState);
    } catch (_) {
      this.textState.set(errorState);
    }

    setTimeout(() => this.textState.set(copyState), COPY_TIMEOUT_DELAY);
  }

  private findScenarios(html: Document): string[] {
    // Находим секцию с классом TestCaseScenarioLayout внутри указанной секции
    const scenarioSection = html.querySelector('[data-testid="section__scenario"]');
    const layout = scenarioSection?.querySelector('.TestCaseScenarioLayout');

    // Находим все элементы с классом TreeElement_node внутри этой секции
    const nodes = layout?.querySelectorAll('.TreeElement_node');

    // Проходимся по всем найденным узлам
    return Array.from(nodes || []).map((node) => {
      // Находим элемент с классом TestCaseScenarioStep__name внутри текущего узла
      const nameElement = node.querySelector('.TestCaseScenarioStep__name');
      // Извлекаем текст и убираем лишние пробелы
      return nameElement?.textContent?.trim() || null;
    }).filter(Boolean) as string[]
  }

  private convertScenarios(data: string[]) {
    return data
      .map((value, index) => {
        const clearedStrig = value.replace(/"/g, "'");
        return `step("${index + 1}. ${clearedStrig}") {}`
      })
      .join('\n');
  }
}

