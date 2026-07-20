# Yaddaş fakt çıxarma promptu (skeleton)

> **Status:** skeleton. Tam şablon ayrıca iterasiyada yazılacaq.

Bura nə yazılacaq: bir söhbət parçasından istifadəçi haqqında **uzunmüddətli dəyəri olan** faktları çıxaran prompt.

Nəzərdə tutulan forma:

- **Giriş:** son N mesaj + artıq mövcud olan faktların siyahısı (təkrar yazmamaq üçün).
- **Çıxış:** ciddi JSON — `[{ "fact": "...", "confidence": 0.0-1.0 }]`. Fakt bir cümlə, üçüncü şəxs, azərbaycanca (məs. `Keçmiş sevgilisinin adı Aysel-dir`).
- **Saxlanılır:** sabit şəxsi məlumat (ad, iş, şəhər), münasibət tarixçəsi, təkrarlanan mövzular, açıq bildirilən üstünlüklər.
- **Saxlanılmır:** ani əhval (`bu gün pis oldum`), bir dəfəlik detallar, artıq mövcud faktın parafrazı, həssas kateqoriyalar (sağlamlıq, din, siyasi baxış) — istifadəçi özü təkid etməyibsə.
- **Post-processing:** hər fakt embed edilir (`vector(768)`) və `memory_facts`-a yazılır; `confidence` aşağı olanlar atılır.
