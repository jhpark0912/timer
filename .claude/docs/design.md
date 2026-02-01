## 아이콘 규칙

- 아이콘 라이브러리: lucide-react (다른 라이브러리 사용 금지)
- 아이콘 기본 사이즈: 16px (인라인), 20px (버튼), 24px (네비게이션)
- 아이콘 컬러: 부모 텍스트 색상 상속 (currentColor)
- 모든 인터랙티브 요소(버튼, 메뉴, 탭)에 아이콘을 포함할 것
- 빈 상태(empty state)에도 반드시 일러스트 아이콘을 배치할 것

### 프로젝트 아이콘 매핑

| 용도 | 아이콘 | import |
|------|--------|--------|
| 스케줄/일정 | CalendarDays | `import { CalendarDays } from "lucide-react"` |
| 카테고리 | FolderOpen / Layers | `import { FolderOpen } from "lucide-react"` |
| 항목/태스크 | ListTodo / CheckSquare | `import { ListTodo } from "lucide-react"` |
| 타이머 | Timer / Clock | `import { Timer } from "lucide-react"` |
| 타이머 시작 | Play | `import { Play } from "lucide-react"` |
| 타이머 일시정지 | Pause | `import { Pause } from "lucide-react"` |
| 타이머 정지 | Square | `import { Square } from "lucide-react"` |
| 타이머 리셋 | RotateCcw | `import { RotateCcw } from "lucide-react"` |
| 수동 입력 | PenLine / FilePlus | `import { PenLine } from "lucide-react"` |
| 타임 트리 | GitBranch / Network | `import { GitBranch } from "lucide-react"` |
| 통계 | BarChart3 / PieChart / TrendingUp | `import { BarChart3 } from "lucide-react"` |
| 설정 | Settings | `import { Settings } from "lucide-react"` |
| 알림/벨 | Bell / BellRing | `import { Bell } from "lucide-react"` |
| 추가 | Plus / PlusCircle | `import { Plus } from "lucide-react"` |
| 수정 | Pencil | `import { Pencil } from "lucide-react"` |
| 삭제 | Trash2 | `import { Trash2 } from "lucide-react"` |
| 검색 | Search | `import { Search } from "lucide-react"` |
| 즐겨찾기 | Star / StarOff | `import { Star } from "lucide-react"` |
| 달력 이동 | ChevronLeft / ChevronRight | `import { ChevronLeft } from "lucide-react"` |
| 빈 상태 | Inbox / CalendarX | `import { Inbox } from "lucide-react"` |
| 기록 출처(타이머) | Clock | 타임 트리에서 🕐 대신 사용 |
| 기록 출처(수동) | PenLine | 타임 트리에서 ✏️ 대신 사용 |

### 카테고리 기본 아이콘

사용자가 카테고리 생성 시 선택할 수 있는 아이콘 목록:
Briefcase(업무), BookOpen(학습), Dumbbell(운동), Coffee(휴식),
Code(개발), Palette(디자인), Music(음악), Heart(건강),
ShoppingCart(쇼핑), Plane(여행), Home(집), Users(모임)

### 아이콘 사용 패턴
```tsx
// 버튼에 아이콘 + 텍스트

  
  항목 추가


// 네비게이션 탭

  } label="스케줄" />
  } label="타이머" />
  } label="통계" />


// 빈 상태

  
  아직 기록이 없습니다

```
```