import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/fr'

dayjs.locale('fr')

dayjs.extend(customParseFormat)

export default dayjs
