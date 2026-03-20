import 'styled-components/native'
import type { AppTheme } from '@nexo/constants/theme'

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
