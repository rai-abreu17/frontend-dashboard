# Boxflow

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## BOX-03 ao vivo (dados reais do backend)

Este é o frontend oficial do BoxFlow. Ele consome dados **reais** para o box instrumentado da demonstração, **BOX-03**, vindos do backend Python no repositório irmão `boxflow-wokwi` (simulador de sensor ToF + reconstrução volumétrica). Os outros 9 boxes continuam com dados cadastrais/ilustrativos mockados em `src/app/core/services/mock-data.ts` — isso é esperado, só o BOX-03 é instrumentado no MVP.

O `TelemetryService` (`src/app/core/services/telemetry.service.ts`) faz polling de `GET /api/latest?box_id=BOX-03` a cada 2 segundos, assim que o app inicia (via `provideAppInitializer` em `app.config.ts`) — não depende de abrir a página de detalhe do box. Ele converte a `occupancy_fraction` (0 a 1, medida na escala da maquete) em um **volume equivalente** na escala industrial do box (`occupancy_fraction × maxVolumeCapacityM3`), e injeta a leitura via `MeasurementService.setLiveMeasurements(...)`, de onde Dashboard, lista de Boxes, detalhe do BOX-03 e a visualização 3D já leem normalmente — nenhum desses componentes precisou ser alterado.

### Testando a medição de volume você mesmo

1. No repositório irmão `boxflow-wokwi`, suba o backend (porta 8000):
   ```bash
   python server/app.py
   ```
2. Aqui, suba o Angular — o `proxy.conf.json` já encaminha `/api/**` para `http://127.0.0.1:8000` (necessário porque o backend não usa CORS):
   ```bash
   npm install
   ng serve
   ```
3. Abra `http://localhost:4200/dashboard`, `http://localhost:4200/boxes` ou `http://localhost:4200/boxes/b3` — pode deixar aberto antes mesmo de existir alguma leitura.
4. De volta no `boxflow-wokwi`, gere leituras para o BOX-03. Para ver o preenchimento crescer de forma suave (recomendado):
   ```bash
   python tools/replay_demo.py --only vazio,entrada-25,entrada-50,entrada-75,entrada-100 --interval 4
   ```
   Ou a sequência completa de 17 cenas (inclui casos de borda como oclusão/fora de alcance, que fazem o volume oscilar de propósito):
   ```bash
   python tools/replay_demo.py
   ```
5. No navegador, o card do BOX-03 e a página de detalhe (volume, % de ocupação, cobertura, histórico e a pilha 3D) atualizam sozinhos a cada ~2s, sem recarregar a página. Os demais boxes permanecem estáticos.

Detalhes completos do backend, do protocolo e da calibração ficam documentados no README do `boxflow-wokwi`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
