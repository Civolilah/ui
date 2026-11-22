/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { configurePdfRenderer } from '@docuninja/builder2.0';
import pdfRendererUrl from '@docuninja/builder2.0/dist/pdf-renderer.js?url';

configurePdfRenderer(pdfRendererUrl);
